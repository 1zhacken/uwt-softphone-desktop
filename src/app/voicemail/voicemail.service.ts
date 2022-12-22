import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { Voicemail } from './voicemail';

@Injectable({
  providedIn: 'root'
})
export class VoicemailService {
  private readonly VOICEMAIL_URL =
    'https://www.uwtservices.com/WebRTC/api/voicemail.php';
  private newMsgCountSource = new Subject<number>();
  vmTimeout: any;

  newMsgCount$ = this.newMsgCountSource.asObservable();

  constructor(private http: HttpClient) {}

  stop(): void {
    clearTimeout(this.vmTimeout);
  }

  getMessageList(lastMsgId?: number): Observable<Voicemail[]> {
    if (!lastMsgId) lastMsgId = 0;
    const params = new HttpParams().append('lastMsgId', lastMsgId.toString());
    return this.http.get<Voicemail[]>(this.VOICEMAIL_URL, { params });
  }

  loadMessage(vm: Voicemail): Observable<Blob> {
    return this.http.post(
      this.VOICEMAIL_URL,
      { vmBoxId: vm.vmBoxId, msgId: vm.msgId },
      { responseType: 'blob' }
    );
  }

  markAsListened(vm: Voicemail): Observable<void> {
    return this.http.put<void>(this.VOICEMAIL_URL, {
      vmBoxId: vm.vmBoxId,
      msgId: vm.msgId
    });
  }

  updateNewMsgCount(count: number): void {
    this.newMsgCountSource.next(count);
  }
}
