import { Component, OnInit } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { RecentsService } from './recents.service';
import { RecentCall } from './recent-call';
import { PhonebookService } from '../shared/services/phonebook.service';

enum CallType {
  All,
  Inbound,
  Outbound,
  Missed
}

@Component({
  selector: 'uwt-recents',
  templateUrl: './recents.component.html',
  styleUrls: ['./recents.component.css'],
  animations: [
    trigger('beginSearch', [
      transition(':enter', [
        style({ width: 0 }),
        animate('300ms ease-in-out', style({ width: '*' }))
      ])
    ])
  ]
})
export class RecentsComponent implements OnInit {
  recentCalls: RecentCall[];
  CallType = CallType;
  callType: CallType;
  contactId: number;
  displaySearchBar = false;
  searchQuery = '';

  constructor(
    private recentsService: RecentsService,
    private phonebookService: PhonebookService
  ) {
    this.recentsService.recentCall$.subscribe((recentCall) =>
      this.recentCalls.unshift(recentCall)
    );
    this.recentsService.contactIdFilter$.subscribe((contactId) => {
      this.contactId = contactId;
      this.searchQuery = this.phonebookService.namesById.get(contactId);
    });
  }

  ngOnInit(): void {
    this.loadRecentCalls();
    this.callType = CallType.All;
  }

  filterCallsByType(callType: CallType): void {
    this.callType = callType;
  }

  loadRecentCalls(): void {
    this.recentsService
      .get()
      .subscribe((recents) => (this.recentCalls = recents));
  }

  shouldDisplayCall(rc: RecentCall): boolean {
    let display = true;

    if (this.contactId > 0) {
      display = rc.record?.contactId == this.contactId;
    } else if (this.searchQuery) {
      display =
        (rc.number + rc.record?.name)
          .toLowerCase()
          .indexOf(this.searchQuery.toLowerCase()) > -1;
    }

    if (display) {
      switch (this.callType) {
        case CallType.Inbound:
          return rc.incoming;
        case CallType.Outbound:
          return !rc.incoming;
        case CallType.Missed:
          return rc.incoming && rc.durationSeconds == 0;
        case CallType.All:
        default:
          return true;
      }
    }
  }
}
