import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { RecentCall } from './recent-call';

import moment from 'moment';
import { Call, CallDirection } from '../core/sip/call';

@Injectable({
  providedIn: 'root'
})
export class RecentsService {
  private readonly RECENTS_URL =
    'https://www.uwtservices.com/WebRTC/api/recents.php';
  private contactIdFilterSource = new Subject<number>();
  private recentCallSource = new Subject<RecentCall>();

  contactIdFilter$ = this.contactIdFilterSource.asObservable();
  recentCall$ = this.recentCallSource.asObservable();

  constructor(private http: HttpClient) {}

  filterByContact(contactId: number): void {
    this.contactIdFilterSource.next(contactId);
  }

  get(): Observable<RecentCall[]> {
    return this.http.get<RecentCall[]>(this.RECENTS_URL);
  }

  save(call: Call): Observable<void> {
    const utcTimestamp = moment(call.startTime || Date.now())
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');
    const durationSeconds = call.startTime
      ? Math.floor((Date.now() - call.startTime) / 1000)
      : 0;
    const incoming = call.direction === CallDirection.Inbound;
    const number = call.remoteAddress;

    const rc: RecentCall = {
      utcTimestamp,
      incoming,
      number,
      durationSeconds
    };

    this.recentCallSource.next(rc);
    return this.http.post<void>(this.RECENTS_URL, rc);
  }
}
