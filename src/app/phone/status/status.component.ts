import { Component } from '@angular/core';
import { TimerService } from '../../shared/services/timer.service';
import { PhoneStatusService } from '../phone-status.service';

@Component({
  selector: 'uwt-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent {
  status: string;
  availability: boolean;
  callInProgress = false;

  constructor(
    private phoneStatus: PhoneStatusService,
    public timerService: TimerService
  ) {
    this.phoneStatus.statusMessage$.subscribe(
      (status) => (this.status = this.maskBase64Numbers(status) )
    );
    this.phoneStatus.callInProgress$.subscribe(
      (callInProgress) => (this.callInProgress = callInProgress)
    );
    this.phoneStatus.serviceAvailability$.subscribe(
      (availability) => (this.availability = availability)
    );
  }

  maskBase64Numbers(status){

    if( typeof status == 'string') {

      if(status.length >= 40){
        // console.log(
        //             typeof (status) ,
        //             status ,
        //             status.length ,
        //             status.replace("Calling","").trim().replace(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,"Phone Number hidden")
        //             )

        return status.replace("Calling","")
              .replace("Connected to","")
              .trim()
              .replace(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,"Phone Number hidden")
      }

    }

    return status;


  }
}
