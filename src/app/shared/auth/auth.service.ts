import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DialerConfig } from '../model/dialer-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly DECRYPT_URL =
    'https://www.uwtservices.com/WebRTC/api/decrypter.php';

  dialerConfig: DialerConfig;
  httpAuth: string;

  constructor(private http: HttpClient) {}

  login(data: string): Observable<void> {
    return this.http
      .post<string>(this.DECRYPT_URL, { encrypted: data })
      .pipe<DialerConfig>(
        map((res) => (res && res['data'] ? JSON.parse(res['data']) : null))
      )
      .pipe<void>(
        map((dialerConfig) => {
          if (dialerConfig) {
            this.dialerConfig = dialerConfig;
            this.httpAuth =
              'Basic ' +
              btoa(`${dialerConfig.accessNumber}:${dialerConfig.password}`);
          }
        })
      );
  }

  loginWithSavedCredentials(accessNumber: string, password: string): void {
    this.dialerConfig  = {
      accessNumber,
      password,
      server: ''
    };
    this.httpAuth =
      'Basic ' +
      btoa(`${this.dialerConfig.accessNumber}:${this.dialerConfig.password}`);
  }
}
