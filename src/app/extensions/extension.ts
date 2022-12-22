export type Status = 'available' | 'busy' | 'offline';

export interface Extension {
  name: string;
  number: string;
  status: Status;
  isSelf: boolean;
}

export interface ExtensionStatus {
  number: string;
  status: Status;
}
