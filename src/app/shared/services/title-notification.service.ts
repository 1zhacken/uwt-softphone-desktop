import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TitleNotificationService {
  private activeNotification = false;
  title: string;
  titleElement: HTMLTitleElement;
  faviconElement: HTMLLinkElement;
  faviconHref: string;

  constructor() {
    this.faviconElement = document.querySelector('head > link[rel=icon]');
    this.titleElement = document.querySelector('head > title');
    this.title = this.titleElement.textContent;
    this.faviconHref = this.faviconElement.href;
  }

  notifyIncomingCall(): void {
    this.activeNotification = true;
    this.runNotificationLoop();
  }

  private runNotificationLoop(): void {
    if (this.activeNotification) {
      this.flashTitle();
      setTimeout(this.runNotificationLoop.bind(this), 750);
    }
  }

  stopNotification(): void {
    this.activeNotification = false;
    this.titleElement.textContent = this.title;
    this.faviconElement.href = this.faviconHref;
  }

  private flashTitle(): void {
    if (this.titleElement.textContent == this.title) {
      this.titleElement.textContent = 'Incoming call';
      this.faviconElement.href = `./assets/favicon-red.ico?cacheBust=${new Date()}`;
    } else {
      this.titleElement.textContent = this.title;
      this.faviconElement.href = this.faviconHref;
    }
  }
}
