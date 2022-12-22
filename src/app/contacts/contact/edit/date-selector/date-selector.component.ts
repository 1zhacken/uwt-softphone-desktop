import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import moment from 'moment';

@Component({
  selector: 'uwt-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DateSelectorComponent)
    }
  ]
})
export class DateSelectorComponent implements ControlValueAccessor {
  writeValue(date: string): void {
    if (date !== null) {
      this.date = date ? date : moment().format('YYYYMMDD');
      this.days = this.getDaysInMonth();
      this.onChange(this.date);
    }
  }

  registerOnChange(fn: (newValue: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private date: string;
  private onChange: (newValue: string) => void;
  private onTouched: () => void;

  days: number[];
  months: string[];
  years: number[];

  constructor() {
    this.months = Array.from(Array(12).keys()).map((i) =>
      moment().month(i).format('MMMM')
    );
    this.years = Array.from(Array(100).keys()).map((i) => moment().year() - i);
  }

  private getDaysInMonth(): number[] {
    return Array.from(Array(moment(this.date).daysInMonth()).keys()).map(
      (i) => i + 1
    );
  }

  private isLeapYear(year: number) {
    return year % 4 == 0;
  }

  isDaySelected(day: number): boolean {
    return day == moment(this.date).date();
  }

  isMonthSelected(monthIndex: number): boolean {
    return monthIndex == moment(this.date).month();
  }

  isYearSelected(year: number): boolean {
    return year == moment(this.date).year();
  }

  onDaySelect(day: number): void {
    this.date = moment(this.date).date(day).format('YYYYMMDD');
    this.onChange(this.date);
    this.onTouched();
  }

  onMonthSelect(monthIndex: number): void {
    let dateObj = moment()
      .year(moment(this.date).year())
      .month(monthIndex)
      .date(moment(this.date).date());

    if (dateObj.month() > monthIndex) {
      dateObj.month(monthIndex);
      dateObj.date(dateObj.daysInMonth());
    }

    this.date = dateObj.format('YYYYMMDD');
    this.days = this.getDaysInMonth();
    this.onChange(this.date);
    this.onTouched();
  }

  onYearSelect(year: number): void {
    const previouslySelectedYear = moment(this.date).year();
    this.date = moment(this.date).year(year).format('YYYYMMDD');

    if (
      this.isLeapYear(year) != this.isLeapYear(previouslySelectedYear) &&
      moment(this.date).month() == 1 /* February */
    ) {
      this.days = this.getDaysInMonth();
    }

    this.onChange(this.date);
    this.onTouched();
  }
}
