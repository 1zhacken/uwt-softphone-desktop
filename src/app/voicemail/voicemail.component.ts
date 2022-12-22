import { Component, OnInit } from '@angular/core';
import { VoicemailService } from './voicemail.service';
import { Voicemail } from './voicemail';
import {
  PhonebookService,
  PhonebookRecord
} from '../shared/services/phonebook.service';

@Component({
  selector: 'uwt-voicemail',
  templateUrl: './voicemail.component.html',
  styleUrls: ['./voicemail.component.css']
})
export class VoicemailComponent implements OnInit {
  private readonly VOICEMAIL_CHECK_FREQ_MS = 20000;

  voicemailList: Voicemail[];
  activeVoicemail: Voicemail;

  constructor(
    private voicemailService: VoicemailService,
    private phonebookService: PhonebookService
  ) {}

  ngOnInit(): void {
    this.checkVoicemailBox();
  }

  private checkVoicemailBox(): void {
    this.voicemailService
      .getMessageList(this.getLastMsgId())
      .subscribe((list) => {
        if (!this.voicemailList) {
          this.voicemailList = list;
        } else if (list) {
          list.reverse().forEach((vm) => this.voicemailList.unshift(vm));
        }
        this.updateNewVoicemailCount();
      });
    if (this.voicemailService.vmTimeout) 
      this.voicemailService.stop();
    this.voicemailService.vmTimeout = setTimeout(this.checkVoicemailBox.bind(this), this.VOICEMAIL_CHECK_FREQ_MS);
  }

  private endCurrentPlayback(): void {
    URL.revokeObjectURL(this.activeVoicemail.audio?.src);
    this.activeVoicemail.audio?.pause();
    this.activeVoicemail.audio = null;
    this.activeVoicemail = null;
  }

  private getLastMsgId(): number {
    if (this.voicemailList?.length) {
      return this.voicemailList[0].msgId;
    } else {
      return 0;
    }
  }

  getContactInfo(callerId: string): PhonebookRecord {
    return this.phonebookService.phonebook.has(callerId)
      ? this.phonebookService.phonebook.get(callerId)
      : null;
  }

  pause(voicemail: Voicemail): void {
    voicemail.audio.pause();
  }

  play(voicemail?: Voicemail): void {
    if (!voicemail || voicemail == this.activeVoicemail) {
      this.activeVoicemail.audio.play();
    } else {
      voicemail.isLoading = true;
      this.voicemailService.loadMessage(voicemail).subscribe((data) => {
        if (this.activeVoicemail) {
          this.endCurrentPlayback();
        }
        this.activeVoicemail = voicemail;
        voicemail.isLoading = false;
        voicemail.audio = new Audio(URL.createObjectURL(data));
        voicemail.audio.play();
        if (voicemail.isNew) {
          voicemail.isNew = false;
          this.voicemailService.markAsListened(voicemail).subscribe();
        }
        this.updateNewVoicemailCount();
        voicemail.audio.ontimeupdate = () => {}; // required to trigger currentTime updates
        voicemail.audio.onended = () => {
          this.endCurrentPlayback();
        };
      });
    }
  }

  seek(percent: number): void {
    this.activeVoicemail.audio.currentTime =
      (percent * this.activeVoicemail.audio.duration) / 100;
  }

  updateNewVoicemailCount(): void {
    if (this.voicemailList?.length) {
      this.voicemailService.updateNewMsgCount(
        this.voicemailList.filter((vm) => vm.isNew).length
      );
    }
  }
}
