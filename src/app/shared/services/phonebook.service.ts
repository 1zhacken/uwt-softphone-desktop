import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactsControllerService } from '../../contacts/contacts-controller.service';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface PhonebookRecord {
  contactId: number;
  name: string;
  label: string;
  phone: string;
  isExtension: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PhonebookService {
  private readonly PHONEBOOK_URL =
    'https://www.uwtservices.com/WebRTC/api/phonebook.php';

  phonebook = new Map<string, PhonebookRecord>();
  namesById = new Map<number, string>();

  constructor(
    private http: HttpClient,
    private contactsController: ContactsControllerService
  ) {
    this.contactsController.refreshContacts$.subscribe(() => {
      this.loadPhonebook().subscribe(() =>
        this.contactsController.updatePhonebook()
      );
    });
  }

  loadPhonebook(): Observable<void> {
    return this.http.get<PhonebookRecord[]>(this.PHONEBOOK_URL).pipe(
      tap((records) => {
        this.phonebook.clear();
        this.namesById.clear();
        records?.forEach((r) => {
          this.phonebook.set(r.phone, r);
          this.namesById.set(r.contactId, r.name);
        });
      }),
      map(() => {})
    );
  }
}
