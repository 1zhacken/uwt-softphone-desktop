import { Component, Input } from '@angular/core';
import { PhoneControllerService } from '../phone-controller.service';
import { PhoneStatusService } from '../phone-status.service';
import { PhonebookService } from '../../shared/services/phonebook.service';
import { AddToContactsBase } from '../../contacts/add-to-contacts-base';
import { ContactsControllerService } from '../../contacts/contacts-controller.service';
import { MenuService } from '../../menu/menu.service';
import { ModalService } from '../../shared/modal/modal.service';
import { ExtensionsService } from '../../extensions/extensions.service';
import { CallDirection } from 'src/app/core/sip/call';

@Component({
  selector: 'uwt-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent extends AddToContactsBase {
  @Input() testButton: boolean;

  CallDirection = CallDirection;
  callDirection: CallDirection;
  callInProgress = false;
  hasIncomingCall = false;
  display: string;
  extensionsConnected = false;
  extensionsEnabled = false;
  isBase64Number:boolean = false;

  constructor(
    contactsController: ContactsControllerService,
    modalService: ModalService,
    menuService: MenuService,
    phonebookService: PhonebookService,
    private extensionsService: ExtensionsService,
    private phoneController: PhoneControllerService,
    private phoneStatus: PhoneStatusService
  ) {
    super(contactsController, menuService, modalService, phonebookService);
    this.phoneController.display$.subscribe((value) => {

      //console.log('display',value)

      if(value.length > 0){
        this.isBase64Number = this.base64NumberValidator(value)
      }


      if (!this.callInProgress){
        this.display = (this.isBase64Number) ? "Number hidden" : value;
      }
      if (!this.hasIncomingCall) {
        this.callDirection = null;
      }

      if(this.isBase64Number){
        this.refreshPhonebookRecord(value);
      }
      else{
        this.refreshPhonebookRecord(this.display);
      }

    });
    this.phoneStatus.callInProgress$.subscribe(
      (callInProgress) => (this.callInProgress = callInProgress)
    );
    this.phoneStatus.incomingCall$.subscribe(
      (hasIncomingCall) => (this.hasIncomingCall = hasIncomingCall)
    );
    this.phoneStatus.callDirection$.subscribe(
      (callDirection) => (this.callDirection = callDirection)
    );
    this.contactsController.phonebookUpdated$.subscribe(() =>
      this.refreshPhonebookRecord(this.display)
    );

    this.extensionsService.enabled$.subscribe(() => {
      this.extensionsEnabled = true;
      this.extensionsConnected = true;
    });
    this.extensionsService.online$.subscribe(
      (online) => (this.extensionsConnected = online)
    );
  }

  filterKey(e: KeyboardEvent): void {
    if (e.key == 'Enter') this.phoneController.dial();
    if (e.key == 'Backspace' || e.key == 'Delete') return;
    if (e.key == 'ArrowLeft' || e.key == 'ArrowRight') return;
    if (e.key == 'Home' || e.key == 'End') return;
    if (e.ctrlKey) return;
    if (e.key.match(/[^0-9+*#]/g)) e.preventDefault();
  }

  onDisplayChange(display: string): void {
    this.display = display.replace(/[^0-9+*#]/g, '');
    this.phoneController.setDisplay(this.display);
    this.callDirection = null;
  }

  showExtensions(): void {
    this.extensionsService.showExtensions();
  }

  base64NumberValidator(phoneNumber){

    //console.log('base64NumberValidator',phoneNumber)

    if( typeof phoneNumber == 'string') {

      if(phoneNumber.length >= 40){
        phoneNumber =  phoneNumber
              .trim()
              .replace(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,"")
      }

    }

    return (phoneNumber.length == 0)? true : false ;


  }
}
