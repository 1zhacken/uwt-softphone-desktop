import { Component, Input } from '@angular/core';
import { Contact } from '../contact/contact';
import { ContactsControllerService } from '../contacts-controller.service';

@Component({
  selector: 'uwt-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  @Input() contacts: Contact[];

  private addingPhoneToContact = false;
  private filterQuery: string;

  constructor(public contactsController: ContactsControllerService) {
    this.contactsController.searchQuery$.subscribe(
      (query) => (this.filterQuery = query)
    );
    this.contactsController.phoneNumber$.subscribe((phoneNumber) => {
      this.addingPhoneToContact = phoneNumber != null;
    });
  }

  getContacts(): Contact[] {
    if (this.filterQuery)
      return this.contacts.filter(
        (c) =>
          (c.firstName + c.lastName + c.company)
            .toLowerCase()
            .indexOf(this.filterQuery.toLowerCase()) > -1
      );
    else return this.contacts;
  }

  viewDetails(contact: Contact): void {
    this.contactsController.selectContact(contact);
    if (this.addingPhoneToContact) this.contactsController.edit();
  }
}
