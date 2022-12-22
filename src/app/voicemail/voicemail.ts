export interface Voicemail {
  line: string;
  utcCreatedOn: string;
  callerId: string;
  durationSeconds: number;
  isNew: boolean;
  vmBoxId: number;
  msgId: number;
  audio?: HTMLAudioElement;
  isLoading?: boolean;
}
