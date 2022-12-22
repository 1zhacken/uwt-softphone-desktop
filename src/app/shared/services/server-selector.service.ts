import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerSelectorService {
  private readonly SERVERS = [
    'wss://webrtc.uwtservices.com:8089/ws',
    'wss://asia-webrtc.uwtservices.com:8089/ws'
  ];

  private fastestServerSource = new Subject<string>();
  fastestServer$ = this.fastestServerSource.asObservable();

  private pingServer(url: string): void {
    const socket = new WebSocket(url, 'sip');

    socket.onopen = () => {
      this.fastestServerSource.next(url);
      socket.close();
    };
  }

  initialize(): void {
    this.SERVERS.forEach((srv) => this.pingServer(srv));
  }
}
