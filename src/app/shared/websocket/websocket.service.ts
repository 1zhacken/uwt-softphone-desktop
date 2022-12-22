import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WSMessage } from './ws.message';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private msgHandlers = new Map<string, ((msg: WSMessage) => void)[]>();
  private onlineSource = new BehaviorSubject<boolean>(false);
  private reconnectTimeout: any;
  private subscription: Subscription;
  private ws: WebSocketSubject<WSMessage>;

  connectionId: string;
  online$ = this.onlineSource.asObservable();

  constructor(private http: HttpClient) {
    this.registerMsgHandler('ping', () =>
      this.send(new WSMessage('pong', null))
    );
  }

  disconnect(): void {
    this.ws.complete();
  }

  connect(): void {
    this.http
      .get<any>(environment.serverUrl + '/dialer/auth/login')
      .subscribe((res) => {
        this.connectionId = res.uuid;
        this.ws = webSocket<WSMessage>({
          url: environment.webSocketUrl,
          protocol: res.uuid,
          openObserver: {
            next: () => {
              clearTimeout(this.reconnectTimeout);
              this.onlineSource.next(true);
            }
          },
          closeObserver: {
            next: (closeEvent) => {
              this.onlineSource.next(false);
              this.subscription.unsubscribe();
              console.log(
                `code: ${closeEvent.code}, reason: ${closeEvent.reason}`
              );
              
                if (closeEvent.code != 1005 && closeEvent.code != 4000) { //1005 user logs out //not sure what 4000 is, but left it anyway
                  // duplicated login
                  this.reconnectTimeout = setTimeout(
                    () => this.connect(),
                    30000
                  );
                }
            }
          }
        });
        this.subscription = this.ws.subscribe(
          this.handleMessage.bind(this),
          this.handleError
        );
      });
  }

  registerMsgHandler(header: string, handler: (msg: WSMessage) => void): void {
    if (!this.msgHandlers.has(header)) {
      this.msgHandlers.set(header, [handler]);
    } else {
      this.msgHandlers.get(header).push(handler);
    }
  }

  send(msg: WSMessage): void {
    if (this.onlineSource.getValue()) {
      this.ws.next(msg);
    }
  }

  private handleError(err: any): void {
    console.error(err);
  }

  private handleMessage(msg: WSMessage): void {
    if (this.onlineSource.getValue()) {
      this.msgHandlers.get(msg.event)?.forEach((handler) => handler(msg));
    }
  }
}
