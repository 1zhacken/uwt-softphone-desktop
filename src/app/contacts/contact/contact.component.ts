import { Component, Input, OnDestroy } from '@angular/core';
import { Contact, ContactDetails, DetailType } from '../contact/contact';
import { ContactsService } from '../contacts.service';
import { ContactsControllerService } from '../contacts-controller.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'uwt-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnDestroy {
  private _contact: Contact;
  private subscriptions: Subscription[] = [];

  @Input()
  set contact(contact: Contact) {
    this._contact = contact;
    this.loadContactDetails();
  }
  get contact(): Contact {
    return this._contact;
  }

  @Input() edit: boolean;

  details: ContactDetails[];

  constructor(
    private contactsService: ContactsService,
    private contactsController: ContactsControllerService
  ) {}

  ngOnDestroy(): void {
    this.clearSubscriptions();
  }

  private loadContactDetails(): void {
    this.clearSubscriptions();
    this.subscriptions.push(
      this.contactsService
        .getContactDetails(this._contact)
        .subscribe((details) => {
          this.details = details;
          this.subscriptions.push(
            this.contactsController.phoneNumber$
              .pipe(take(1))
              .subscribe((phoneNumber) => {
                if (phoneNumber) {
                  this.details.push({
                    contactId: this.contact.id,
                    typeId: DetailType.Phone,
                    label: null,
                    value: phoneNumber
                  });
                  this.contactsController.setPhoneNumberBuffer(null);
                }
              })
          );
        })
    );
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  updateDetails(details: ContactDetails[]): void {
    this.details = details;
  }
}
