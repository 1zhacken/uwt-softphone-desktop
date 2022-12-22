import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {
  PhonebookService,
  PhonebookRecord
} from '../services/phonebook.service';
import { MenuService, MenuOptions } from '../../menu/menu.service';
import { ContactsControllerService } from '../../contacts/contacts-controller.service';
import { ModalService } from '../modal/modal.service';
import { AddToContactsBase } from '../../contacts/add-to-contacts-base';
import { PhoneControllerService } from '../../phone/phone-controller.service';

@Component({
  selector: 'uwt-call-record',
  templateUrl: './call-record.component.html',
  styleUrls: ['./call-record.component.css']
})
export class CallRecordComponent extends AddToContactsBase implements OnInit {
  @Input() callerId: string;
  @Input() durationSeconds: number;
  @Input() missedCall = false;
  @Input() utcTimestamp: string;

  @Output() contact = new EventEmitter<PhonebookRecord>();

  constructor(
    phonebookService: PhonebookService,
    contactsController: ContactsControllerService,
    modalService: ModalService,
    menuService: MenuService,
    private phoneController: PhoneControllerService
  ) {
    super(contactsController, menuService, modalService, phonebookService);
  }

  ngOnInit(): void {
    this.refreshPhonebookRecord(this.callerId);
    this.contact.emit(this.phonebookRecord);
    this.contactsController.phonebookUpdated$.subscribe(() => {
      this.refreshPhonebookRecord(this.callerId);
      this.contact.emit(this.phonebookRecord);
    });
  }

  initiateCall(): void {
    this.menuService.selected = MenuOptions.Keypad;
    this.phoneController.setDisplay(this.callerId);
    this.phoneController.dial();
  }

  viewContactInfo(): void {
    console.log(this.phonebookRecord);
    this.menuService.selected = MenuOptions.Contacts;
    this.contactsController.selectContactById(this.phonebookRecord.contactId);
  }
}
