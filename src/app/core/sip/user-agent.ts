import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UA, WebSocketInterface } from 'jssip';
import { IncomingRTCSessionEvent, OutgoingRTCSessionEvent } from 'jssip/lib/UA';
import { EndEvent } from 'jssip/lib/RTCSession';
import { Call, CallDirection } from './call';
import { DialerConfig } from 'src/app/shared/model/dialer-config';

@Injectable({ providedIn: 'root' })
export class UserAgent {
  private callerId: string;
  private connectionLostSource = new Subject<void>();
  private incomingCallSource = new Subject<Call>();
  private userAgent: UA;
  socket: WebSocketInterface;

  $connectionLost = this.connectionLostSource.asObservable();
  $incomingCall = this.incomingCallSource.asObservable();



  disconnect(){
    this.userAgent?.stop();
    if (this.socket){
      this.socket.disconnect();
    }
  }

  async initialize(dialerConfig: DialerConfig): Promise<void> {
    this.socket = new WebSocketInterface(dialerConfig.server);
    const domain = dialerConfig.server
      .replace('wss://', '')
      .replace(':8089/ws', '');
    this.userAgent = new UA({
      display_name: (dialerConfig.phoneToDial ? 'TEST BUTTON' : ''),
      sockets: [this.socket],
      password: dialerConfig.password,
      uri: `sip:${dialerConfig.accessNumber}@${domain}`
    });

    this.userAgent.on('disconnected', () => this.connectionLostSource.next());
    this.userAgent.on(
      'newRTCSession',
      (event: IncomingRTCSessionEvent | OutgoingRTCSessionEvent) => {
        if (event.originator == 'local') return;
        const redirectedName = event.request.getHeader('X-UWT-REDIRECTED-NAME');
        const redirectedNumber = event.request.getHeader('X-UWT-REDIRECTED-NUMBER');
        const call = new Call(
          CallDirection.Inbound,
          redirectedName || redirectedNumber,
          event.session
        );
        this.incomingCallSource.next(call);
      }
    );

    return new Promise<any>((resolve, reject) => {
      let firstFail = true;
      this.userAgent.start();
      this.userAgent.register();
      this.userAgent.on('registered', () => resolve(this.userAgent));
      this.userAgent.on('disconnected', () => reject('Server unreachable'));
      this.userAgent.on('registrationFailed', () => {
        if (firstFail) firstFail = false;
        else reject('Registration failed');
      });
    });
  }

  placeCall(destination: string): Promise<Call> {
    return new Promise<Call>((resolve, reject) => {     
      const call = new Call(
        CallDirection.Outbound,
        null, // redirectedFrom does not apply when placing a call
        this.userAgent.call(destination, {
          mediaConstraints: { audio: true },
          eventHandlers: {
            progress: () => resolve(call),
            failed: (event: EndEvent) => reject(event.cause),
            getusermediafailed: () =>
              reject('No microphone or speaker detected')
          },
          extraHeaders: this.callerId
            ? [`X-UWT-CALLER-ID: ${this.callerId}`]
            : undefined            
        })
      );
    });
  }

  setCallerId(callerId: string): void {
    this.callerId = callerId;
  }



}
