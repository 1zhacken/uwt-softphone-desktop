import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Extension, ExtensionStatus, Status } from './extension';
import { environment } from '../../environments/environment';
import { WebSocketService } from '../shared/websocket/websocket.service';
import { WSMessage } from '../shared/websocket/ws.message';

@Injectable({
  providedIn: 'root'
})
export class ExtensionsService {
  private enabledSource = new Subject<void>();
  private extensionStatusSource = new ReplaySubject<ExtensionStatus[]>();
  private showExtensionsSource = new Subject<void>();
  private status: Status;

  online$ = this.wss.online$;
  enabled$ = this.enabledSource.asObservable();
  extensionStatus$ = this.extensionStatusSource.asObservable();
  showExtensions$ = this.showExtensionsSource.asObservable();

  constructor(private http: HttpClient, private wss: WebSocketService) {
    this.wss.registerMsgHandler(
      'status',
      this.extensionStatusMsgHandler.bind(this)
    );
    this.wss.registerMsgHandler('requestStatus', () =>
      this.setStatus(this.status)
    );
    this.wss.online$.subscribe((online) => {
      if (online) this.setStatus('available');
    });
  }

  private extensionStatusMsgHandler(msg: WSMessage): void {
    this.extensionStatusSource.next(msg.data as ExtensionStatus[]);
  }

  emitExtensionEnabled(): void {
    this.enabledSource.next();
  }

  getExtensions(): Observable<Extension[]> {
    return this.http
      .get<Extension[]>(environment.serverUrl + '/dialer/extensions')
      .pipe(
        map((extensions) =>
          extensions.map((extension) => {
            extension.status = 'offline';
            return extension;
          })
        )
      );
  }

  requestGroupStatus(): void {
    this.wss.send(new WSMessage('requestGroupStatus', null));
  }

  setStatus(status: Status): void {
    this.status = status;
    this.wss.send(new WSMessage('status', status));
  }

  showExtensions(): void {
    this.showExtensionsSource.next();
  }
}
