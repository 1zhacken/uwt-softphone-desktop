import { Component, Input } from '@angular/core';
import { PhoneControllerService } from '../phone-controller.service';
import { PhoneStatusService } from '../phone-status.service';

@Component({
  selector: 'uwt-keypad',
  templateUrl: './keypad.component.html',
  styleUrls: ['./keypad.component.css']
})
export class KeypadComponent {
  private callInProgress = false;
  
  @Input() testButton: boolean;

  constructor(
    private phoneController: PhoneControllerService,
    private phoneStatus: PhoneStatusService
  ) {
    this.phoneStatus.callInProgress$.subscribe(
      (callInProgress) => this.callInProgress = callInProgress
    );
  }

  pushKey(key: string): void {
    this.phoneController.sendKey(key, this.testButton || this.callInProgress);
  }
}
