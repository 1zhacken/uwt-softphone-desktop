import { Component } from '@angular/core';
import { MenuService, MenuOptions } from './menu.service';
import { PhoneStatusService } from '../phone/phone-status.service';
import { VoicemailService } from '../voicemail/voicemail.service';
import { UpdateService } from '../shared/services/update.service';

@Component({
  selector: 'uwt-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  MenuOptions = MenuOptions;
  callInProgress = false;
  incomingCall = false;
  update:any = {};

  constructor(
    public menuService: MenuService,
    public voicemailService: VoicemailService,
    private phoneStatus: PhoneStatusService,
    private updateService:UpdateService
  ) {
    this.phoneStatus.callInProgress$.subscribe(
      (callInProgress) => (this.callInProgress = callInProgress)
    );
    this.phoneStatus.incomingCall$.subscribe(
      (incomingCall) => (this.incomingCall = incomingCall)
    );

    this.updateService.update.subscribe((o:any)=>this.update = o);
  }
}
