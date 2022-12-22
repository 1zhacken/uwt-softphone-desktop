import { Component, OnInit } from '@angular/core';
import { MenuService, MenuOptions } from '../menu/menu.service';

import { first } from 'rxjs/operators';
import { AuthService } from '../shared/auth/auth.service';
import { ServerSelectorService } from '../shared/services/server-selector.service';
import { PhonebookService } from '../shared/services/phonebook.service';
import { WebSocketService } from '../shared/websocket/websocket.service';
import { PhoneService } from '../core/sip/phone.service';
import { Router } from '@angular/router';

@Component({
  selector: 'uwt-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  loading = true;
  phonebookLoading = true;
  menuOptions = MenuOptions;
  testButtonMode = false;

  constructor(
    private authService: AuthService,
    private phonebookService: PhonebookService,
    private router: Router,
    private serverSelector: ServerSelectorService,
    private wss: WebSocketService,
    private phoneService: PhoneService,
    public menuService: MenuService
  ) {}

  ngOnInit(): void {  

    if (!this.authService.dialerConfig) {
      this.router.navigate(['login']);      
    } else {
      this.serverSelector.fastestServer$.pipe(first()).subscribe((srv) => {
        this.authService.dialerConfig.server = srv;
        this.phoneService.initialize(this.authService.dialerConfig);
        this.wss.connect();
        this.phonebookService
          .loadPhonebook()
          .subscribe(() => (this.phonebookLoading = false));
        this.loading = false;
  
        if (this.authService.dialerConfig.phoneToDial)
          this.testButtonMode = true;
      });
      this.serverSelector.initialize();
    }
  }
}