import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timer' })
export class TimerPipe implements PipeTransform {
  transform(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds - h * 3600) / 60);
    const s = Math.floor(seconds) - h * 3600 - m * 60;

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
}
