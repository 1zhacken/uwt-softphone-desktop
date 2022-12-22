import { Component, Input } from '@angular/core';
import { ContactDetails, DetailType, Contact } from '../contact';
import { MenuService, MenuOptions } from '../../../menu/menu.service';
import { PhoneControllerService } from '../../../phone/phone-controller.service';
import { RecentsService } from 'src/app/recents/recents.service';

@Component({
  selector: 'uwt-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  readonly DetailType = DetailType;

  @Input() contact: Contact;
  @Input()
  set details(details: ContactDetails[]) {
    if (details) {
      this.phoneNumbers = details.filter(
        (d) => d.typeId == this.DetailType.Phone
      );
      this.emails = details.filter((d) => d.typeId == this.DetailType.Email);
      this.addresses = details.filter(
        (d) => d.typeId == this.DetailType.Address
      );
      this.notes = details.filter((d) => d.typeId == this.DetailType.Note);
      this.dates = details.filter((d) => d.typeId == this.DetailType.Date);
    }
  }

  constructor(
    private menuService: MenuService,
    private phoneController: PhoneControllerService,
    private recentsService: RecentsService
  ) {}

  phoneNumbers: ContactDetails[] = [];
  emails: ContactDetails[] = [];
  addresses: ContactDetails[] = [];
  notes: ContactDetails[] = [];
  dates: ContactDetails[] = [];

  initiateCall(phoneNumber: string): void {
    this.menuService.selected = MenuOptions.Keypad;
    this.phoneController.setDisplay(phoneNumber);
    this.phoneController.dial();
  }

  viewRecentCalls(): void {
    this.menuService.selected = MenuOptions.Recents;
    this.recentsService.filterByContact(this.contact.id);
  }

  replacePhoneNumber(phoneNumber):string{

    var numberHiddenText = "Phone Number hidden, Click To Dial"

    var isRegexMatch = (phoneNumber).replace(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,"")

    //console.log(phoneNumber,isRegexMatch.length)
    return (phoneNumber.length >= 40 && isRegexMatch.length == 0) ? numberHiddenText  : phoneNumber

  }
}
