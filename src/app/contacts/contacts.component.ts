import { Component, OnInit } from '@angular/core';
import {
  ContactsControllerService,
  ContactViews
} from './contacts-controller.service';
import { Contact } from './contact/contact';
import { ContactsService } from './contacts.service';

@Component({
  selector: 'uwt-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  ContactViews = ContactViews;

  contacts: Contact[];
  view: ContactViews;

  constructor(
    public contactsController: ContactsControllerService,
    private contactsService: ContactsService
  ) {}

  ngOnInit(): void {
    this.refreshContacts();
    this.contactsController.refreshContacts$.subscribe(() =>
      this.refreshContacts()
    );
    this.contactsController.selectedView$.subscribe(
      (view) => (this.view = view)
    );
    this.contactsController.selectedContactId$.subscribe((contactId) => {
      this.contactsController.selectContact(
        this.contacts.find((c) => c.id == contactId)
      );
    });
  }

  private refreshContacts(): void {
    this.contactsService
      .getContacts()
      .subscribe((contacts) => (this.contacts = contacts));
  }
}
