import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly LOGIN_URL = 'https://www.uwtservices.com/WebRTC/api/login.php';
  
  constructor(private http: HttpClient) { }

  login(accessNumber: string, password: string): Observable<{ data: string, error?: string }> {
    return this.http.post<{ data: string, error?: string }>(this.LOGIN_URL, { accessNumber, password });
  }
}
