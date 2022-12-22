import { Injectable } from '@angular/core';
import { PhoneStatusService } from '../phone/phone-status.service';

export enum MenuOptions {
  Settings,
  Keypad,
  Recents,
  Voicemail,
  Contacts
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  selected = MenuOptions.Keypad;

  constructor(private phoneStatus: PhoneStatusService) {
    this.phoneStatus.incomingCall$.subscribe((incomingCall) => {
      if (incomingCall) this.selected = MenuOptions.Keypad;
    });
    this.phoneStatus.callInProgress$.subscribe((callInProgress) => {
      if (callInProgress) this.selected = MenuOptions.Keypad;
    });
  }
}
