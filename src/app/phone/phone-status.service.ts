import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TitleNotificationService } from '../shared/services/title-notification.service';
import { ExtensionsService } from '../extensions/extensions.service';
import { CallDirection } from '../core/sip/call';

@Injectable({
  providedIn: 'root'
})
export class PhoneStatusService {
  constructor(
    private titleNotification: TitleNotificationService,
    private extensionsService: ExtensionsService
  ) {}

  private callDirectionSource = new Subject<CallDirection>();
  private callInProgressSource = new Subject<boolean>();
  private incomingCallSource = new Subject<boolean>();
  private serviceAvailabilitySource = new Subject<boolean>();
  private statusMessageSource = new Subject<string>();
  private transferInProgressSource = new Subject<boolean>();
  private remoteTransferConnectedSource = new Subject<boolean>();

  callDirection$ = this.callDirectionSource.asObservable();
  callInProgress$ = this.callInProgressSource.asObservable();;
  incomingCall$ = this.incomingCallSource.asObservable();
  serviceAvailability$ = this.serviceAvailabilitySource.asObservable();
  statusMessage$ = this.statusMessageSource.asObservable();
  transferInProgress$ = this.transferInProgressSource.asObservable();
  remoteTransferConnected$ = this.remoteTransferConnectedSource.asObservable();


  setCallDirection(direction: CallDirection): void {
    this.callDirectionSource.next(direction);
  }

  setCallInProgress(inProgress: boolean): void {
    this.callInProgressSource.next(inProgress);
    this.extensionsService.setStatus(inProgress ? 'busy' : 'available');
  }

  setRemoteTransferConnected(rc:boolean){
    this.remoteTransferConnectedSource.next(rc);
  }

  setIncomingCall(incoming: boolean): void {
    this.incomingCallSource.next(incoming);
    if (incoming) this.titleNotification.notifyIncomingCall();
    else this.titleNotification.stopNotification();
  }

  setServiceAvailability(availability: boolean): void {
    this.serviceAvailabilitySource.next(availability);
  }

  setStatusMessage(message: string): void {
    this.statusMessageSource.next(message);
  }

  setTransferInProgress(isTransferInProgress: boolean): void {
    this.transferInProgressSource.next(isTransferInProgress);
  }
}
