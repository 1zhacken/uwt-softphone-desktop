import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import NoSleep from 'nosleep.js';
import { AuthService } from './shared/auth/auth.service';
import { MenuService, MenuOptions } from './menu/menu.service'; 
import { PhoneControllerService } from './phone/phone-controller.service'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loading = true;
  phonebookLoading = true;
  testButtonMode = false;

  constructor(
    private menuService: MenuService, 
    private phoneController: PhoneControllerService, 
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    let noSleep = new NoSleep();
    document.addEventListener(
      'touchstart',
      function enableNoSleep() {
        document.removeEventListener('touchstart', enableNoSleep, false);
        noSleep.enable();
      },
      false
    );

    let updateVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    updateVh();
    window.addEventListener('resize', updateVh);

    const accessNumber = window.localStorage.accessNumber;
    const password = window.localStorage.password;  
    const dataParam = location.href.split('?')[1]?.split('data=')[1]?.split('&')[0];
    
    if (dataParam) {
      this.authService.login(dataParam).subscribe(() => {
        this.router.navigate(['phone']);
      });
    } else if(accessNumber && password) {
      this.authService.loginWithSavedCredentials(accessNumber, password);
      this.router.navigate(['phone']);
    } else {
      this.router.navigate(['login']);
    }

    window.addEventListener('load', () => {
      try {
        window.bridge.callTo((event, target) => {
          console.log(event, target);
          this.menuService.selected = MenuOptions.Keypad;
          this.phoneController.setDisplay(target);
          this.phoneController.dial();
        });
      }
      catch (e) {
        console.error(e);
      }
    });
  }
}
