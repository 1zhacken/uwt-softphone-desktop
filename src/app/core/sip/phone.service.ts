import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { UserAgent } from './user-agent';
import { TimerService } from 'src/app/shared/services/timer.service';
import { PhoneControllerService } from 'src/app/phone/phone-controller.service';
import { PhoneStatusService } from 'src/app/phone/phone-status.service';
import { RecentsService } from 'src/app/recents/recents.service';
import { Call, CallDirection, CallStatus } from './call';
import { DialerConfig } from 'src/app/shared/model/dialer-config';
import { SettingsService } from 'src/app/settings/settings.service';

@Injectable({ providedIn: 'root' })
export class PhoneService {
  private audio: HTMLAudioElement = document.querySelector('#audio-remote');
  private dtmfTone: HTMLAudioElement[] = [
    document.querySelector('#dtmfTone0'),
    document.querySelector('#dtmfTone1'),
    document.querySelector('#dtmfTone2'),
    document.querySelector('#dtmfTone3'),
    document.querySelector('#dtmfTone4'),
    document.querySelector('#dtmfTone5'),
    document.querySelector('#dtmfTone6'),
    document.querySelector('#dtmfTone7'),
    document.querySelector('#dtmfTone8'),
    document.querySelector('#dtmfTone9'),
    document.querySelector('#dtmfToneS'),
    document.querySelector('#dtmfToneP')
];
  private ringbacktone: HTMLAudioElement = document.querySelector('#ringbacktone');
  private ringtone: HTMLAudioElement;

  private connectedCalls: Call[] = [];
  private transferee: Call;
  private unansweredCall: Call;
  private userAgent: UserAgent;

  constructor(
    private phoneController: PhoneControllerService,
    private phoneStatus: PhoneStatusService,
    private recentsService: RecentsService,
    private settingsService: SettingsService,
    private timerService: TimerService
  ) { }

  async initialize(dialerConfig: DialerConfig): Promise<void> {
  
    try {
      this.phoneController.init();
      this.userAgent = new UserAgent();
      this.phoneController.callerId$.subscribe((callerId: any) => {
      this.userAgent.setCallerId(callerId);
       });

      this.settingsService.ringtone$.subscribe((ringtone) => this.ringtone = document.querySelector(`#${ringtone}`));

      await this.userAgent.initialize(dialerConfig).then((o: any) => {
        this.settingsService.setUa(o);
      });
      this.phoneStatus.setServiceAvailability(true);
      this.phoneStatus.setStatusMessage('Connected');
      this.hookUpController();
      this.hookUpUserAgent();
      if (dialerConfig.phoneToDial) {
        this.phoneController.setDisplay(dialerConfig.phoneToDial);
        this.dial(dialerConfig.phoneToDial);
      }
    } catch (error) {
      this.phoneStatus.setServiceAvailability(false);
      this.phoneStatus.setStatusMessage(error);
    }
  }

  private answer(): void {
    this.unansweredCall
      .answer(this.audio)
      .then((answeredCall) => {
        this.connectedCalls.push(answeredCall);
        this.phoneStatus.setCallInProgress(true);
        this.timerService.start(answeredCall.startTime);
      })
      .catch((error) => {
        this.phoneStatus.setStatusMessage(error);
      })
      .finally(() => {
        this.ringtone.pause();
        this.phoneStatus.setIncomingCall(false);
        this.unansweredCall = null;
      });
  }

  private async cancelTransfer(): Promise<void> {
    this.phoneStatus.setTransferInProgress(false);
    //this.ringbacktone.pause();

    try {
      await this.unansweredCall?.hangUp();
      await this.connectedCalls[0]?.hangUp();
    } catch (error) {
      this.phoneStatus.setStatusMessage(error);
    }

    try {
      if (this.transferee) {
        await this.transferee.unhold(this.audio);
        this.connectedCalls = [this.transferee];
        this.phoneStatus.setStatusMessage(
          `Connected to ${this.transferee.remoteAddress}`
        );
      } else {
        this.phoneStatus.setCallInProgress(false);
        this.phoneStatus.setStatusMessage('Call ended');
      }
    } catch (error) {
      this.phoneStatus.setCallInProgress(false);
      this.phoneStatus.setStatusMessage(
        `Failed to resume call with ${this.transferee.remoteAddress}`
      );
    } finally {
      this.transferee = null;
    }
  }

  private dial(destination: string): void {
    this.timerService.clear();
    this.phoneStatus.setCallInProgress(true);
    this.phoneStatus.setCallDirection(CallDirection.Outbound);
    this.phoneStatus.setStatusMessage(`Calling ${destination}`);

    this.userAgent
      .placeCall(destination)
      .then((call) => {
        //this.ringbacktone.play();
        call.setEarlyMedia(this.audio);

        call.onRemoteAnswer(this.audio, () => {
          this.unansweredCall = null;
          //this.ringbacktone.pause();
          this.connectedCalls.push(call);
          this.phoneStatus.setCallInProgress(true);
          this.phoneStatus.setStatusMessage(`Connected to ${destination}`);
          this.timerService.start(call.startTime);
        });
        call.onRemoteTerminate((cause) => {
          //this.ringbacktone.pause();
          this.handleRemoteTermination(call, cause);
        });        
        
        this.unansweredCall = call;
      })
      .catch((error) => {
        this.phoneStatus.setStatusMessage(error);
        this.phoneStatus.setCallInProgress(false);
        //this.ringbacktone.pause();
      });
  }

  private dtmf(key: string): void {
    var index: number;
    
    if (key == "*")
      index = 10;
    else if (key == "#")
      index = 11;
    else
      index = +key;
    this.dtmfTone[index].play();
    this.connectedCalls.forEach((call) => call.dtmf(key));
  }

  private handleConnectionLost(): void {
    this.phoneStatus.setServiceAvailability(false);
    this.phoneStatus.setStatusMessage('Disconnected');
  }

  private handleIncomingCall(call: Call): void {
    if (this.unansweredCall || this.connectedCalls.length > 0) {
      call.hangUp();
      return;
    }
    this.unansweredCall = call;
    this.unansweredCall.onRemoteTerminate((cause) => {
      this.handleRemoteTermination(call, cause);
    });
    this.ringtone.loop = true;
    this.ringtone.play();
    this.phoneStatus.setIncomingCall(true);
    this.phoneStatus.setCallDirection(CallDirection.Inbound);
    this.phoneStatus.setStatusMessage(
      `Incoming call redirected from ${call.redirectedFrom}`
    );
    this.phoneController.setDisplay(call.remoteAddress);
  }

  private handleRemoteTermination(call: Call, cause: string): void {
    switch (call.status) {
      case CallStatus.Connected:
        this.connectedCalls = this.connectedCalls.filter((c) => c != call);
        this.saveCallToHistory(call);
        if (this.connectedCalls.length == 0) {
          this.phoneStatus.setCallInProgress(false);
          this.phoneStatus.setStatusMessage('Call ended');
          this.timerService.stop();
        }
        break;
      case CallStatus.OnHold:
        this.transferee = null;
        this.phoneStatus.setTransferInProgress(false);
        break;
      case CallStatus.Ringing:
        this.unansweredCall = null;
        this.ringtone.pause();
        this.phoneStatus.setIncomingCall(false);
        this.phoneStatus.setCallInProgress(false);
        if (cause=='Rejected')
          cause='Unavailable';
        this.phoneStatus.setStatusMessage(cause);
        this.saveCallToHistory(call);
        break;
    }
  }

  private hangUp(): void {
    if (this.connectedCalls.length > 0) {
      Promise.all(this.connectedCalls.map((c) => c.hangUp())).then(() => {
        this.connectedCalls.forEach((c) => this.saveCallToHistory(c));
        this.connectedCalls = [];
        this.phoneStatus.setCallInProgress(false);
        this.phoneStatus.setStatusMessage('Call ended');
        this.timerService.stop();
      });
    } else {
      this.unansweredCall?.hangUp().then(() => {
        const inbound = this.unansweredCall.direction == CallDirection.Inbound;
        this.recentsService.save(this.unansweredCall);
        this.unansweredCall = null;
        this.ringtone.pause();
        this.phoneStatus.setCallInProgress(false);
        this.phoneStatus.setIncomingCall(false);
        this.phoneStatus.setStatusMessage(
          `Call ${inbound ? 'declined' : 'canceled'}`
        );
        this.timerService.stop();
        //this.ringbacktone.pause();
      });
    }
  }

  private hookUpController(): void {
    this.phoneController.answer$.subscribe(this.answer.bind(this));
    this.phoneController.cancelTransfer$.subscribe(() => {
      this.cancelTransfer();
    });
    this.phoneController.dial$.subscribe(this.dial.bind(this));
    this.phoneController.dtmf$.subscribe(this.dtmf.bind(this));
    this.phoneController.hangUp$.subscribe(this.hangUp.bind(this));
    this.phoneController.merge$.subscribe(this.merge.bind(this));
    this.phoneController.mute$.subscribe(this.mute.bind(this));
    this.phoneController.transfer$.subscribe(this.transfer.bind(this));
  }

  private hookUpUserAgent(): void {
    this.userAgent.$connectionLost.subscribe(
      this.handleConnectionLost.bind(this)
    );
    this.userAgent.$incomingCall.subscribe(this.handleIncomingCall.bind(this));
  }

  private async initiateAttendedTransfer(to: string): Promise<string> {
    if (this.connectedCalls.length != 1)
      return Promise.reject('Transfer unavailable');

    this.transferee = this.connectedCalls[0];
    try {
      await this.transferee.hold();
      this.connectedCalls = [];
      const transferTarget = await this.userAgent.placeCall(to);
      this.unansweredCall = transferTarget;
     // await this.ringbacktone.play();
      transferTarget.setEarlyMedia(this.audio);
      transferTarget.onRemoteAnswer(this.audio, () => {
        this.unansweredCall = null;
        //this.ringbacktone.pause();
        this.connectedCalls.push(transferTarget);
        this.phoneStatus.setRemoteTransferConnected(true);
        return `Connected to ${to}`;
      });
      transferTarget.onRemoteTerminate(() => {
        this.unansweredCall = null;
       // this.ringbacktone.pause();
        this.cancelTransfer();
        this.phoneStatus.setRemoteTransferConnected(false);
      });
    } catch (error) {
      if (error != 'Hold failed') {
        // calling transferTarget failed
        this.unansweredCall = null;
        this.cancelTransfer();
        this.phoneStatus.setRemoteTransferConnected(false);
      } else {
        throw 'Transfer failed';
      }
    }
  }

  private async finalizeAttendedTransfer(): Promise<void> {
    try {
      if (!this.transferee) throw 'Transfer failed';
      await this.connectedCalls[0].hold();
      await this.transferee.transfer(this.connectedCalls[0]);
    } catch (error) {
      throw error;
    } finally {
      this.connectedCalls = [];
      this.phoneStatus.setCallInProgress(false);
      this.timerService.stop();
      this.saveCallToHistory(this.transferee);
      this.transferee = null;
    }
  }

  private merge(): void {
    if (!this.transferee || this.connectedCalls.length != 1) return;

    this.transferee.unhold(null).then(() => {
      this.connectedCalls.push(this.transferee);
      this.transferee = null;
      this.phoneStatus.setTransferInProgress(false);
      Call.merge(this.connectedCalls, this.audio);
      this.connectedCalls.forEach((c) => {
        c.clearListeners();
        c.onRemoteTerminate((cause) => {
          this.handleRemoteTermination(c, cause);
        });
      });
    });
  }

  private mute(isMuted: boolean): void {
    this.connectedCalls.forEach((call) => call.mute(isMuted));
  }

  private saveCallToHistory(call: Call): void {
    if (!call) return;
    this.recentsService
      .save(call)
      .pipe(first())
      .subscribe(
        () => { }, // call saved successfully
        (error) => { } // something went wrong
      );
  }

  private transfer(to?: string): void {
    if (to) {
      this.phoneStatus.setTransferInProgress(true);
      this.initiateAttendedTransfer(to)
        .then(() => this.phoneStatus.setStatusMessage(`Connected to ${to}`))
        .catch((err) => {
          this.phoneStatus.setStatusMessage(err);
          this.phoneStatus.setTransferInProgress(false);
        });
    } else {
      this.finalizeAttendedTransfer()
        .then(() => this.phoneStatus.setStatusMessage('Transfer completed'))
        .catch((err) => this.phoneStatus.setStatusMessage(err))
        .finally(() => this.phoneStatus.setTransferInProgress(false));
    }
  }
}
