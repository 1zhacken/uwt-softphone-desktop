import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'callDuration' })
export class CallDurationPipe implements PipeTransform {
  transform(durationSeconds: number, incoming?: boolean): string {
    if (durationSeconds == 0) {
      return incoming ? 'Missed call' : 'Canceled call';
    } else {
      if (durationSeconds < 60) {
        return `${durationSeconds} second${durationSeconds > 1 ? 's' : ''}`;
      } else if (durationSeconds < 3600) {
        const minutes = Math.floor(durationSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else {
        const hours = Math.floor(durationSeconds / 3600);
        return `${hours} hours${hours > 1 ? 's' : ''}`;
      }
    }
  }
}
