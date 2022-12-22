import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { AuthService } from '../shared/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'uwt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  accessNumber: string;
  password: string;
  error: string;
  rememberAccessNumber = false;

  constructor(private authService: AuthService, private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
    if (window.localStorage.accessNumber) {
      this.accessNumber = window.localStorage.accessNumber;
      this.rememberAccessNumber = true;
    }
  }

  doLogin(): void {
    this.error = null;
    this.loginService.login(this.accessNumber, this.password).subscribe(res => {
      if (res.data) {
        if (this.rememberAccessNumber) {
          window.localStorage.setItem('accessNumber', this.accessNumber);
          window.localStorage.setItem('password', this.password);
        } else {
          window.localStorage.clear();
        }
        this.authService.login(res.data).subscribe(() => {
          this.router.navigate(['phone']);
        });
      }
      else {
        this.error = res.error;
        this.password = null;
      }
    });
  }
}
