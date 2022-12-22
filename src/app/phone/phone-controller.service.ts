import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PhoneControllerService {
  answerSource:any;
  backspaceSource:any;
  callerIdSource:any  = new Subject<string>();
  cancelTransferSource:any;
  dialSource:any;
  displaySource:any;
  dtmfSource:any;
  hangUpSource:any;
  mergeSource:any;
  muteSource:any;
  transferSource:any;

  answer$:any;
  backspace$:any;
  callerId$:any = this.callerIdSource.asObservable();
  cancelTransfer$:any;
  display$:any;
  dial$:any;
  dtmf$:any;
  hangUp$:any;
  merge$:any;
  mute$:any;
  transfer$:any;

  constructor() {
    this.init();
  }  

  init(): void {
    this.answerSource = new Subject<void>();
    this.backspaceSource = new Subject<void>();
    //this.callerIdSource = new Subject<string>();
    this.cancelTransferSource = new Subject<void>();
    this.dialSource = new Subject<string>();
    this.displaySource = new BehaviorSubject<string>('');
    this.dtmfSource = new Subject<string>();
    this.hangUpSource = new Subject<void>();
    this.mergeSource = new Subject<void>();
    this.muteSource = new Subject<boolean>();
    this.transferSource = new Subject<string | void>();
  
    this.answer$ = this.answerSource.asObservable();
    this.backspace$ = this.backspaceSource.asObservable();
    //this.callerId$ = this.callerIdSource.asObservable();
    this.cancelTransfer$ = this.cancelTransferSource.asObservable();
    this.display$ = this.displaySource.asObservable();
    this.dial$ = this.dialSource.asObservable();
    this.dtmf$ = this.dtmfSource.asObservable();
    this.hangUp$ = this.hangUpSource.asObservable();
    this.merge$ = this.mergeSource.asObservable();
    this.mute$ = this.muteSource.asObservable();
    this.transfer$ = this.transferSource.asObservable();
  }

  answer(): void {
    this.answerSource.next();
  }

  backspace(): void {
    if (this.displaySource.getValue()) {
      this.displaySource.next(this.displaySource.getValue().slice(0, -1));
    }
  }

  cancelTransfer(): void {
    this.cancelTransferSource.next();
  }

  dial(): void {
    this.dialSource.next(this.displaySource.getValue());
  }

  hangUp(): void {
    this.hangUpSource.next();
  }

  merge(): void {
    this.mergeSource.next();
  }

  mute(isMuted: boolean): void {
    this.muteSource.next(isMuted);
  }

  sendKey(key: string, isDtmf: boolean): void {
    if (isDtmf) {
      this.dtmfSource.next(key);
    } else {
      this.displaySource.next(this.displaySource.getValue() + key);
    }
  }

  setCallerId(callerId: string): void {
    this.callerIdSource.next(callerId);
  }
  

  setDisplay(display: string): void {
    this.displaySource.next(display);
  }

  transfer(to?: string): void {
    this.transferSource.next(to);
  }
}
