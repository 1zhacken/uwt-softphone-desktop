export class Contact {
  id?: number;
  firstName: string;
  lastName: string;
  company: string;

  constructor() {
    this.firstName = '';
    this.lastName = '';
    this.company = '';
  }
}

export interface ContactDetails {
  contactId: number;
  typeId: DetailType;
  label: string;
  value: string;
}

export enum DetailType {
  Phone = 1,
  Email,
  Address,
  Note,
  Date
}
