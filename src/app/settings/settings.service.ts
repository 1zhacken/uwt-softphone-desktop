import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CallerId } from './caller-id';
import { Router } from '@angular/router';
import { WebSocketService } from '../shared/websocket/websocket.service';
import { AuthService } from '../shared/auth/auth.service';
import { MenuService, MenuOptions} from '../menu/menu.service';
import { VoicemailService } from '../voicemail/voicemail.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly CALLER_ID_URL =
    'https://www.uwtservices.com/WebRTC/api/caller-id.php';
  private readonly CALLER_IDS_URL =
    'https://www.uwtservices.com/WebRTC/api/caller-ids.php';
  private callerIdsSource = new Subject<CallerId[]>();
  private ringtoneSource = new BehaviorSubject<string>(localStorage.getItem('ringtone') || 'ringtone-1');
  ua: any;

  callerIds$ = this.callerIdsSource.asObservable();
  ringtone$ = this.ringtoneSource.asObservable();

  constructor(private http: HttpClient, private router: Router, private wss: WebSocketService, private auth: AuthService, private menu:MenuService, private voicemail:VoicemailService) {}

  getCallerIds(): Observable<CallerId[]> {
    return this.http.get<CallerId[]>(this.CALLER_IDS_URL);
  }

  getDefaultCallerId(): Observable<string> {
    return this.http
      .get<string>(this.CALLER_ID_URL)
      .pipe(map((res) => (res && res['callerId'] ? res['callerId'] : null)));
  }

  getRingtone(): string {
    return localStorage.getItem('ringtone') || 'ringtone-1';
  }

  loadCallerIds(): void {
    this.http
      .get<CallerId[]>(this.CALLER_IDS_URL)
      .subscribe((res) => this.callerIdsSource.next(res));
  }

  setUa(o:any): void {
    this.ua = o;
  }

  logout(): void {
    localStorage.removeItem('password');
    this.voicemail.stop();
    this.wss.disconnect();
    this.ua.stop();
    this.router.navigate(['login']).then(()=>{
      this.auth.httpAuth = null;;
      this.menu.selected = MenuOptions.Keypad;
    })  }

  selectRingtone(ringtone: string): void {
    localStorage.setItem('ringtone', ringtone);
    this.ringtoneSource.next(ringtone);
  }
}
