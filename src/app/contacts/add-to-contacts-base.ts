import { Contact } from './contact/contact';
import { ContactsControllerService } from './contacts-controller.service';
import { MenuService, MenuOptions } from '../menu/menu.service';
import { ModalService } from '../shared/modal/modal.service';
import {
  PhonebookService,
  PhonebookRecord
} from '../shared/services/phonebook.service';

export class AddToContactsBase {
  phonebookRecord: PhonebookRecord;

  constructor(
    protected contactsController: ContactsControllerService,
    protected menuService: MenuService,
    private modalService: ModalService,
    protected phonebookService: PhonebookService
  ) {}

  private addToNewContact(phoneNumber: string): void {
    this.contactsController.selectContact(new Contact());
    this.contactsController.setPhoneNumberBuffer(phoneNumber);
    this.contactsController.edit();
    this.menuService.selected = MenuOptions.Contacts;
  }

  private addToExistingContact(phoneNumber: string): void {
    this.contactsController.setPhoneNumberBuffer(phoneNumber);
    this.contactsController.list();
    this.menuService.selected = MenuOptions.Contacts;
  }

  refreshPhonebookRecord(phoneNumber: string): void {
    phoneNumber = '+' + phoneNumber.replace('+', '');

    if (this.phonebookService.phonebook.has(phoneNumber)) {
      this.phonebookRecord = this.phonebookService.phonebook.get(phoneNumber);
    } else {
      this.phonebookRecord = null;
    }
  }

  addNumber(phoneNumber: string): void {
    const options = ['Create New Contact', 'Add to Existing Contact'];
    const functions = [
      this.addToNewContact.bind(this, phoneNumber),
      this.addToExistingContact.bind(this, phoneNumber)
    ];

    this.modalService.open(null, options).then(
      (option) => functions[option](),
      () => {} // user dismissed modal, nothing to do here
    );
  }
}
