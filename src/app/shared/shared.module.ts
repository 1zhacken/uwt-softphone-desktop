import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallRecordComponent } from './call-record/call-record.component';
import { ModalComponent } from './modal/modal.component';
import { CallDurationPipe } from './pipes/call-duration.pipe';
import { TimerPipe } from './pipes/timer.pipe';
import { TimestampPipe } from './pipes/timestamp.pipe';
import { AutoFocusDirective } from './directives/auto-focus.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    CallRecordComponent,
    ModalComponent,
    AutoFocusDirective,
    CallDurationPipe,
    TimerPipe,
    TimestampPipe
  ],
  exports: [
    CallRecordComponent,
    ModalComponent,
    AutoFocusDirective,
    CallDurationPipe,
    TimerPipe,
    TimestampPipe
  ]
})
export class SharedModule {}
