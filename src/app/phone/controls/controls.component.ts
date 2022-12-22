import { Component, Input } from '@angular/core';
import { PhoneControllerService } from '../phone-controller.service';
import { PhoneStatusService } from '../phone-status.service';

@Component({
  selector: 'uwt-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent {
  @Input() testButton: boolean;

  callInProgress = false;
  hasIncomingCall = false;
  isMuted = false;
  transferInProgress = false;
  remoteTransferConnected = false;

  constructor(
    public phoneController: PhoneControllerService,
    private phoneStatus: PhoneStatusService
  ) {
    phoneStatus.callInProgress$.subscribe((callInProgress) => {
      this.callInProgress = callInProgress;
      this.isMuted = false;
    });
    phoneStatus.incomingCall$.subscribe((hasIncomingCall) => {
      this.hasIncomingCall = hasIncomingCall;
    });
    phoneStatus.transferInProgress$.subscribe((isTransferInProgress) => {
      this.transferInProgress = isTransferInProgress;
    });

    phoneStatus.remoteTransferConnected$.subscribe((isRemoteTransferConnected:any)=>{
      this.remoteTransferConnected = isRemoteTransferConnected;
    })
  }

  backspaceDisplay(): void {
    this.phoneController.backspace();
  }

  answer(): void {
    this.phoneController.answer();
  }

  cancelTransfer(): void {
    this.phoneController.cancelTransfer();
  }

  dial(): void {
    this.phoneController.dial();
  }

  hangUp(): void {
    this.phoneController.hangUp();
  }

  merge(): void {
    this.phoneController.merge();
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.phoneController.mute(this.isMuted);
  }

  transfer(): void {
    this.phoneController.transfer();
  }
}
