import { PhonebookRecord } from '../shared/services/phonebook.service';

export interface RecentCall {
  utcTimestamp: string;
  incoming: boolean;
  number: string;
  durationSeconds: number;
  record?: PhonebookRecord;
}
