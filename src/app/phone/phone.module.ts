import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PhoneComponent } from './phone.component';
import { DisplayComponent } from './display/display.component';
import { StatusComponent } from './status/status.component';
import { KeypadComponent } from './keypad/keypad.component';
import { ControlsComponent } from './controls/controls.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    PhoneComponent,
    DisplayComponent,
    StatusComponent,
    KeypadComponent,
    ControlsComponent
  ],
  exports: [PhoneComponent]
})
export class PhoneModule {}
