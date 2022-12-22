import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private isActive = false;
  private timerSource = new Subject<string>();

  timer$ = this.timerSource.asObservable();

  clear(): void {
    this.timerSource.next(this.formatTimer(0));
  }

  private formatTimer(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds - h * 3600) / 60);
    const s = Math.floor(seconds - h * 3600 - m * 60);

    let time = '';
    if (h > 0) {
      time = `${h}:`;
      time += `${m < 10 ? `0${m}` : m}:`;
    } else {
      time = `${m}:`;
    }
    time += `${s < 10 ? `0${s}` : s}`;

    return time;
  }

  private runTimer(t0: number): void {
    if (this.isActive) {
      this.timerSource.next(this.formatTimer((Date.now() - t0) / 1000));
      setTimeout(this.runTimer.bind(this, t0), 1000);
    }
  }

  start(t0?: number): void {
    t0 = t0 ? t0 : Date.now();
    this.isActive = true;
    this.clear();
    this.runTimer(t0);
  }

  stop(): void {
    this.isActive = false;
  }
}
