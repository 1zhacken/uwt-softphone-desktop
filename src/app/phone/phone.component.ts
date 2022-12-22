import { Component, Input } from '@angular/core';

@Component({
  selector: 'uwt-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.css']
})
export class PhoneComponent {
  @Input() testButton: boolean = false;
}
