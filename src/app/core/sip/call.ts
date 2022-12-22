import {
  RTCSession,
  EndEvent,
  ReferEvent,
  ReInviteEvent
} from 'jssip/lib/RTCSession';

export enum CallDirection {
  Inbound,
  Outbound
}

export enum CallStatus {
  Connected,
  OnHold,
  Ringing
}

export class Call {
  private _startTime: number;
  private _status: CallStatus;

  get remoteAddress(): string {
    return this.rtcSession.remote_identity.uri.user;
  }

  get startTime(): number {
    return this._startTime;
  }

  get status(): CallStatus {
    return this._status;
  }

  constructor(
    readonly direction: CallDirection,
    readonly redirectedFrom: string,
    private readonly rtcSession: RTCSession
  ) {
    this._status = CallStatus.Ringing;
  }

  answer(audioElement: HTMLAudioElement): Promise<Call> {
    return new Promise<Call>((resolve, reject) => {
      this.rtcSession.answer({ mediaConstraints: { audio: true } });
      this.rtcSession.on('confirmed', () => {
        this.setUpRemoteAudio(audioElement);
        this._startTime = Date.now();
        this._status = CallStatus.Connected;
        resolve(this);
      });
      this.rtcSession.on('getusermediafailed', () => {
        this.rtcSession.removeAllListeners();
        reject('No microphone or speaker detected');
      });
      this.rtcSession.on('replaces', (event: ReferEvent) => {
        console.log('onreplaces');
        console.log(event);
      });
      this.rtcSession.on('refer', (event: ReferEvent) => {
        console.log('onrefer');
        console.log(event);
      });
      this.rtcSession.on('reinvite', (event: ReInviteEvent) => {
        console.log('onreinvite');
        console.log(event);
      });
    });
  }

  clearListeners(): void {
    this.rtcSession.removeAllListeners();
  }

  dtmf(key: string): void {
    this.rtcSession.sendDTMF(key);
  }

  hangUp(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.rtcSession.on('ended', () => resolve());
      this.rtcSession.on('failed', (event: EndEvent) => {
        if (event.cause == 'Canceled' || event.cause == 'Rejected') resolve();
        else reject(event.cause);
      });
      this.rtcSession.terminate();
    });
  }

  hold(): Promise<void> {
    if (this.status != CallStatus.Connected)
      return Promise.reject('Hold failed');

    return new Promise<void>((resolve, reject) => {
      const holdSucceeded = this.rtcSession.hold(undefined, () => {
        this._status = CallStatus.OnHold;
        resolve();
      });
      if (!holdSucceeded) reject('Hold failed');
    });
  }

  unhold(audioElement: HTMLAudioElement): Promise<void> {
    if (this.status != CallStatus.OnHold)
      return Promise.reject('Unhold failed');

    return new Promise<void>((resolve, reject) => {
      const unholdSucceeded = this.rtcSession.unhold(undefined, () => {
        this._status = CallStatus.Connected;
        if (audioElement) this.setUpRemoteAudio(audioElement);
        resolve();
      });
      if (!unholdSucceeded) reject('Unhold failed');
    });
  }

  // peer-to-peer conferencing (more than 5 peers may get unstable)
  // to expand capabilities, a peer-to-server model is required
  static merge(calls: Call[], audioElement: HTMLAudioElement): void {
    audioElement.srcObject = new MediaStream(
      calls.map((c) => c.getReceiverAudioTrack())
    );

    calls.forEach((destinationCall) => {
      const ctx = new AudioContext();
      const mediaStreamDestination = ctx.createMediaStreamDestination();
      calls
        .filter((sourceCall) => sourceCall != destinationCall)
        .forEach((sourceCall) => {
          ctx
            .createMediaStreamSource(
              new MediaStream([sourceCall.getReceiverAudioTrack()])
            )
            .connect(mediaStreamDestination);
        });
      ctx
        .createMediaStreamSource(
          new MediaStream([destinationCall.getSenderAudioTrack()])
        )
        .connect(mediaStreamDestination);
      destinationCall.rtcSession.connection
        .getSenders()[0]
        .replaceTrack(mediaStreamDestination.stream.getTracks()[0]);
    });
  }

  mute(isMuted: boolean): void {
    if (isMuted) {
      this.rtcSession.mute({ audio: true });
    } else {
      this.rtcSession.unmute({ audio: true });
    }
  }

  onRemoteAnswer(audioElement: HTMLAudioElement, onAnswer: () => void) {
    this.rtcSession.on('confirmed', () => {
      this.setUpRemoteAudio(audioElement);
      this._startTime = Date.now();
      this._status = CallStatus.Connected;
      onAnswer();
    });
  }

  onRemoteTerminate(onEnded: (cause: string) => void): void {
    this.rtcSession.on('ended', (event: EndEvent) => {
      if (event.originator != 'local') {
        onEnded(event.cause);
      }
    });
    this.rtcSession.on('failed', (event: EndEvent) => {
      if (event.originator != 'local') {
        onEnded(event.cause);
      }
    });
  }

  getConnection():any{
    return this.rtcSession.connection;
  }

  setEarlyMedia(audioElement: HTMLAudioElement){
      this.rtcSession.connection.addEventListener('addstream', (e:any)=>{
          audioElement.srcObject = new MediaStream();
          audioElement.srcObject = e.stream;
        }); 
  }

  transfer(targetCall: Call): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.rtcSession.refer(targetCall.rtcSession.remote_identity.uri, {
        eventHandlers: {
          requestFailed: () => reject('Transfer request failed'),
          accepted: () => resolve(),
          failed: () => reject('Transfer failed')
        },
        replaces: targetCall.rtcSession
      });
    });
  }

  private getReceiverAudioTrack(): MediaStreamTrack {
    return this.rtcSession.connection
      .getReceivers()
      .find((receiver) => receiver.track.kind === 'audio').track;
  }

  private getSenderAudioTrack(): MediaStreamTrack {
    return this.rtcSession.connection
      .getSenders()
      .find((sender) => sender.track.kind === 'audio').track;
  }

  private setUpRemoteAudio(audioElement: HTMLAudioElement): void {
    audioElement.srcObject = new MediaStream();
    audioElement.srcObject.addTrack(this.getReceiverAudioTrack());
  }
}
