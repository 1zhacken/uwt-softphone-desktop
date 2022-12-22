import { Injectable } from '@angular/core';
import { PhoneControllerService } from '../../phone/phone-controller.service';
import { WebSocketService } from '../websocket/websocket.service';
import { PhoneStatusService } from '../../phone/phone-status.service';
import { WSMessage } from '../websocket/ws.message';

@Injectable()
export class ZohoService {
  constructor(
    private phoneController: PhoneControllerService,
    private phoneStatus: PhoneStatusService,
    private wss: WebSocketService
  ) {
    wss.registerMsgHandler('Zoho.Dial', this.dial.bind(this));
  }

  private dial(msg: WSMessage): void {
    this.phoneController.setDisplay(msg.data);
    this.phoneController.dial();
  }
}
