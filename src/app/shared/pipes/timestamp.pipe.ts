import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({ name: 'timestamp' })
export class TimestampPipe implements PipeTransform {
  transform(utcTimestamp: string): string {
    const timestamp = moment.utc(utcTimestamp).local();
    const today = moment().startOf('day');
    const thisWeek = moment().subtract(7, 'day').startOf('day');

    if (!timestamp.isBefore(today)) return timestamp.format('LT');
    else if (!timestamp.isBefore(thisWeek)) return timestamp.format('dddd');
    else
      return timestamp
        .format('L')
        .replace(timestamp.format('YYYY'), timestamp.format('YY'));
  }
}
