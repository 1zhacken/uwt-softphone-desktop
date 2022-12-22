import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { SeekbarComponent } from './seekbar/seekbar.component';
import { VoicemailComponent } from './voicemail.component';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [SeekbarComponent, VoicemailComponent],
  exports: [VoicemailComponent]
})
export class VoicemailModule {}
