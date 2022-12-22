import { Component } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import {
  ContactsControllerService,
  ContactViews
} from '../contacts-controller.service';
import { Contact } from '../contact/contact';

@Component({
  selector: 'uwt-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('beginSearch', [
      transition(':enter', [
        style({ width: 0 }),
        animate('300ms ease-in-out', style({ width: '*' }))
      ])
    ])
  ]
})
export class HeaderComponent {
  ContactViews = ContactViews;
  contact: Contact;
  filterEnabled = false;
  filterQuery = '';
  listTitle = 'Contacts';

  constructor(public contactsController: ContactsControllerService) {
    this.contactsController.contact$.subscribe(
      (contact) => (this.contact = contact)
    );
    this.contactsController.phoneNumber$.subscribe((phoneNumber) => {
      this.listTitle = phoneNumber ? 'Select a Contact' : 'Contacts';
    });
  }

  addContact(): void {
    this.contactsController.selectContact(new Contact());
    this.contactsController.edit();
  }

  cancel(): void {
    this.contactsController.contact$.subscribe((contact) => {
      if (contact.id) this.contactsController.cancel();
      else this.contactsController.list();
    });
  }

  edit(): void {
    this.contactsController.edit();
  }

  save(): void {
    this.contactsController.save();
  }

  toggleFilter(): void {
    this.filterEnabled = !this.filterEnabled;
    this.filterQuery = this.filterEnabled ? this.filterQuery : '';
    this.updateFilter();
  }

  updateFilter(): void {
    this.contactsController.updateSearchQuery(this.filterQuery);
  }

  viewContacts(): void {
    this.contactsController.list();
  }
}
