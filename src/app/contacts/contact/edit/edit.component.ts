import {
  Component,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ContactsService } from '../../contacts.service';
import { DetailType, ContactDetails, Contact } from '../contact';
import { ContactsControllerService } from '../../contacts-controller.service';
import _ from 'underscore';

@Component({
  selector: 'uwt-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnDestroy {
  private _contactInput: Contact;

  @Input()
  set contact(contact: Contact) {
    this._contactInput = JSON.parse(JSON.stringify(contact));
    this._contact = JSON.parse(JSON.stringify(contact));
  }
  get contact(): Contact {
    return this._contactInput;
  }

  @Input()
  set details(details: ContactDetails[]) {
    this._phoneNumbers = details.filter(
      (d) => d.typeId == this.DetailType.Phone
    );
    this._emails = details.filter((d) => d.typeId == this.DetailType.Email);
    this._addresses = details.filter(
      (d) => d.typeId == this.DetailType.Address
    );
    this._notes = details.filter((d) => d.typeId == this.DetailType.Note);
    this._dates = details.filter((d) => d.typeId == this.DetailType.Date);

    this.phoneNumbers = JSON.parse(JSON.stringify(this._phoneNumbers));
    this.emails = JSON.parse(JSON.stringify(this._emails));
    this.addresses = JSON.parse(JSON.stringify(this._addresses));
    this.notes = JSON.parse(JSON.stringify(this._notes));
    this.dates = JSON.parse(JSON.stringify(this._dates));

    this.handlePhoneNumberFromBuffer();
  }

  @Output() updatedDetails = new EventEmitter<ContactDetails[]>();

  readonly DetailType = DetailType;

  isDeleting = false;

  phoneNumbers: ContactDetails[];
  emails: ContactDetails[];
  addresses: ContactDetails[];
  notes: ContactDetails[];
  dates: ContactDetails[];

  private _contact: Contact;
  private _phoneNumbers: ContactDetails[];
  private _emails: ContactDetails[];
  private _addresses: ContactDetails[];
  private _notes: ContactDetails[];
  private _dates: ContactDetails[];

  private subscriptions: Subscription[] = [];

  constructor(
    private contactsService: ContactsService,
    private contactsController: ContactsControllerService
  ) {
    this.subscriptions.push(
      this.contactsController.cancelTrigger$.subscribe(() => this.onCancel())
    );
    this.subscriptions.push(
      this.contactsController.saveTrigger$.subscribe(() => this.onSave())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private getDefaultLabel(detailType: DetailType): string {
    switch (detailType) {
      case DetailType.Phone:
        return 'Mobile';
      case DetailType.Email:
        return 'Email';
      case DetailType.Address:
        return 'Address';
      default:
        return '';
    }
  }

  private handlePhoneNumberFromBuffer(): void {
    // phone numbers added from the buffer will always have a label === null
    const i = this._phoneNumbers.findIndex((pn) => pn.label === null);

    if (i > -1) {
      this._phoneNumbers.splice(i, 1);
      this.onEdit();
    }

    this.phoneNumbers = this.phoneNumbers.map((pn) => {
      pn.label =
        pn.label === null ? this.getDefaultLabel(DetailType.Phone) : pn.label;
      return pn;
    });
  }

  private hasInvalidDetail(): boolean {
    const details: Array<ContactDetails> = [].concat(
      this.phoneNumbers,
      this.emails,
      this.addresses,
      this.notes,
      this.dates
    );

    return details.findIndex((d) => !d.label || !d.value) > -1;
  }

  addDetail(details: ContactDetails[], detailType: DetailType): void {
    details.push({
      contactId: this.contact.id,
      typeId: detailType,
      label: this.getDefaultLabel(detailType),
      value: ''
    });
    this.onEdit();
  }

  cancelDeletion(): void {
    this.isDeleting = false;
  }

  confirmDeletion(): void {
    this.contactsService.deleteContact(this.contact).subscribe(() => {
      this.contactsController.list();
      this.contactsController.refreshContacts();
    });
  }

  delete(): void {
    this.isDeleting = true;
  }

  onCancel(): void {
    this.updatedDetails.emit(
      [].concat(
        this._phoneNumbers,
        this._emails,
        this._addresses,
        this._notes,
        this._dates
      )
    );
  }

  onEdit(): void {
    if (this.hasInvalidDetail()) {
      this.contactsController.setUnsavedChanges(false);
    } else {
      this.contactsController.setUnsavedChanges(this.isEdited());
    }
  }

  onSave(): void {
    const details = [].concat(
      this.phoneNumbers,
      this.emails,
      this.addresses,
      this.notes,
      this.dates
    );

    this.updatedDetails.emit(details);

    if (!this.contact.id)
      this.contactsService
        .createContact(this.contact, details)
        .subscribe((contact) => {
          this.contactsController.selectContact(contact);
          this.contactsController.refreshContacts();
        });
    else
      this.contactsService
        .updateContact(this.contact, details)
        .subscribe(() => {
          this.contactsController.selectContact(this.contact);
          this.contactsController.refreshContacts();
        });
  }

  isEdited(): boolean {
    return !(
      _.isEqual(this.contact, this._contact) &&
      _.isEqual(this.phoneNumbers, this._phoneNumbers) &&
      _.isEqual(this.emails, this._emails) &&
      _.isEqual(this.addresses, this._addresses) &&
      _.isEqual(this.notes, this._notes) &&
      _.isEqual(this.dates, this._dates)
    );
  }

  removeDetail(detail: ContactDetails, details: ContactDetails[]): void {
    details.splice(
      details.findIndex((d) => d === detail),
      1
    );
    this.onEdit();
  }
}
