import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import { Contact, ContactDetails } from './contact/contact';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private readonly CONTACTS_URL =
    'https://www.uwtservices.com/WebRTC/api/contacts.php';
  private readonly CONTACT_DETAILS_URL =
    'https://www.uwtservices.com/WebRTC/api/contact-details.php';

  constructor(private http: HttpClient) {}

  createContact(
    contact: Contact,
    details: ContactDetails[]
  ): Observable<Contact> {
    return this.http.post<Contact>(this.CONTACTS_URL, contact).pipe(
      concatMap((contact) => {
        details = details.map((detail) => {
          detail.contactId = contact.id;
          return detail;
        });
        return this.http
          .post<void>(this.CONTACT_DETAILS_URL, details)
          .pipe(map(() => contact));
      })
    );
  }

  deleteContact(contact: Contact): Observable<void> {
    const params = new HttpParams().append('contactId', contact.id.toString());
    return this.http.delete<void>(this.CONTACTS_URL, { params });
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.CONTACTS_URL);
  }

  getContactDetails(contact: Contact): Observable<ContactDetails[]> {
    if (!contact.id) {
      return of([]);
    }

    const params = new HttpParams().append('contactId', contact.id.toString());
    return this.http
      .get<ContactDetails[]>(this.CONTACT_DETAILS_URL, { params })
      .pipe(map((details) => (details ? details : [])));
  }

  updateContact(
    contact: Contact,
    details: ContactDetails[]
  ): Observable<void[]> {
    return forkJoin(
      this.http.put<void>(this.CONTACTS_URL, contact),
      this.http.put<void>(this.CONTACT_DETAILS_URL, details)
    );
  }
}
