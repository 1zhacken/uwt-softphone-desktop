import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({ name: 'detailDate' })
export class DetailDatePipe implements PipeTransform {
  transform(date: string): string {
    const dateObj = moment(date);
    if (dateObj.year() == 1900) {
      return dateObj.format('MMMM D');
    } else {
      return dateObj.format('MMMM D, YYYY');
    }
  }
}
