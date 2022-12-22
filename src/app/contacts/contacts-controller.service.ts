import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Contact } from './contact/contact';

export enum ContactViews {
  List,
  Details,
  Edit
}

@Injectable({
  providedIn: 'root'
})
export class ContactsControllerService {
  private contactSource = new BehaviorSubject<Contact>(null);
  private cancelTriggerSource = new Subject<void>();
  private hasUnsavedChangesSource = new BehaviorSubject<boolean>(false);
  private phonebookUpdatedSource = new Subject<void>();
  private phoneNumberSource = new BehaviorSubject<string>(null);
  private refreshContactsSource = new Subject<void>();
  private saveTriggerSource = new Subject<void>();
  private searchQuerySource = new Subject<string>();
  private selectedContactIdSource = new Subject<number>();
  private selectedViewSource = new BehaviorSubject<ContactViews>(
    ContactViews.List
  );

  contact$ = this.contactSource.asObservable();
  cancelTrigger$ = this.cancelTriggerSource.asObservable();
  hasUnsavedChanges$ = this.hasUnsavedChangesSource.asObservable();
  phonebookUpdated$ = this.phonebookUpdatedSource.asObservable();
  phoneNumber$ = this.phoneNumberSource.asObservable();
  refreshContacts$ = this.refreshContactsSource.asObservable();
  saveTrigger$ = this.saveTriggerSource.asObservable();
  searchQuery$ = this.searchQuerySource.asObservable();
  selectedContactId$ = this.selectedContactIdSource.asObservable();
  selectedView$ = this.selectedViewSource.asObservable();

  cancel(): void {
    this.cancelTriggerSource.next();
    this.selectedViewSource.next(ContactViews.Details);
  }

  edit(): void {
    this.selectedViewSource.next(ContactViews.Edit);
    this.setUnsavedChanges(false);
  }

  list(): void {
    this.selectedViewSource.next(ContactViews.List);
  }

  refreshContacts(): void {
    this.refreshContactsSource.next();
  }

  save(): void {
    this.saveTriggerSource.next();
  }

  selectContact(contact: Contact): void {
    this.contactSource.next(contact);
    this.selectedViewSource.next(ContactViews.Details);
  }

  selectContactById(contactId: number): void {
    this.selectedContactIdSource.next(contactId);
  }

  setPhoneNumberBuffer(phoneNumber: string): void {
    this.phoneNumberSource.next(phoneNumber);
  }

  setUnsavedChanges(hasUnsavedChanges: boolean): void {
    this.hasUnsavedChangesSource.next(hasUnsavedChanges);
  }

  updatePhonebook(): void {
    this.phonebookUpdatedSource.next();
  }

  updateSearchQuery(query: string): void {
    this.searchQuerySource.next(query);
  }
}
