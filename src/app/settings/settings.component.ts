import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { SettingsService } from './settings.service';
import { CallerId } from './caller-id';
import { PhoneControllerService } from '../phone/phone-controller.service';
import { WebSocketService } from '../shared/websocket/websocket.service';
import { environment } from 'src/environments/environment';
import { UserAgent } from '../core/sip/user-agent';
import { UpdateService } from '../shared/services/update.service';


@Component({
  selector: 'uwt-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnChanges, OnDestroy {
  private audioElement: HTMLAudioElement;
  
  callerIds: CallerId[];
  countries: string[];
  ringtones = [ 'ringtone-1', 'ringtone-2', 'ringtone-3', 'ringtone-4' ];
  selectedCountry: string;
  selectedCallerId: string;
  selectedRingtone: string = 'ringtone-1';
  isProduction = true;
  update:any = {};
  progress:any = {};

  constructor(
    private settingsService: SettingsService,
    private phoneController: PhoneControllerService,
    private wss: WebSocketService,
    private ua:UserAgent,
    private updateService:UpdateService
  ) { }

  ngOnInit(): void {
    this.isProduction = environment.production;    
    this.settingsService.getCallerIds().subscribe((callerIds) => {
      this.callerIds = callerIds;
      this.updateCountriesDropdown();
      this.settingsService.getDefaultCallerId().subscribe((callerId) => {
        this.selectCallerId(callerId, true);  
      },
      (err:any)=>{
        console.log('Default ID settings-error', err)
      },
      ()=>{
        this.getUserSettings();
      });
    });  
    
    this.versionUpdates();
  }

  versionUpdates(){
    this.updateService.update.subscribe((o:any)=>this.update=o);
  }

  getUserSettings(){
    let ringtone = window.localStorage.getItem('ringtone');
    let country =  window.localStorage.getItem("country");
    let callerId = window.localStorage.getItem('callerid');
    if(ringtone) this.selectedRingtone = ringtone; 
    if(country) this.selectedCountry = country;
    if(callerId) this.selectedCallerId = callerId;
    this.phoneController.setCallerId(this.selectedCallerId);
  }

  getLines(): string[] {
    return this.callerIds
      ? this.callerIds
          .filter((x) => x.country == this.selectedCountry)
          .map((x) => x.callerId)
      : [];
  }

  getPhonebridgeUrl(): string {
    return (
      'https://accounts.zoho.com/oauth/v2/auth?' +
      'scope=PhoneBridge.call.log,PhoneBridge.zohoone.search' +
      '&client_id=1000.8UNFREEINZ6ONNGVQARJSXQMF9VG6H' +
      '&redirect_uri=https://services.unitedworldtelecom.com/dialer/phonebridge/register' +
      `&state=${this.wss.connectionId}` +
      '&response_type=code' +
      '&access_type=offline'
    );
  }

  logout(): void {
    this.settingsService.logout();
  }

  selectCallerId(callerId: string, isDefault?: boolean): void {
    this.selectedCountry = this.callerIds.filter(
      (x) => x.callerId == callerId
    )[0].country;
    this.selectedCallerId = callerId;
    if (!isDefault) {
      this.updateCallerId();
    }
  }

  selectFirstCallerId(): void {
    this.selectedCallerId = this.getLines()[0];
    this.updateCallerId();
  }

  setUserSettings(){
    window.localStorage.setItem("country", this.selectedCountry);
    window.localStorage.setItem("callerid", this.selectedCallerId);
  }

  selectRingtone(ringtone: string): void {
    window.localStorage.setItem('ringtone', ringtone);
    this.audioElement?.pause();
    this.audioElement = document.querySelector(`#${ringtone}`);
    this.audioElement.loop = false;
    this.audioElement.play();
    this.settingsService.selectRingtone(ringtone);
  }

  updateCountriesDropdown(): void {
    this.countries = Array.from(new Set(this.callerIds.map((x) => x.country)));
  }

  private updateCallerId(): void {
    this.phoneController.setCallerId(this.selectedCallerId);
    this.setUserSettings();
  }

  createWindow():void{
    if ((<any>window).require) {
      const remote = (<any>window).require('electron').remote;
      const browser = remote.BrowserWindow;      
      const win = new browser();
      //win.maximize();
      console.log(this.update.link)
      win.loadURL(this.update.link);     
      win.webContents.session.on('will-download', (event, item, webContents) => {    
        item.on('updated', (event, state) => {
          if (state === 'interrupted') {
            console.log('Download is interrupted but can be resumed')
          } else if (state === 'progressing') {            
            if (item.isPaused()) {
              this.progress.status = "Download Paused";
            } else {
              this.progress.status = "Downloading";
              this.progress.percentage = Math.round((item.getReceivedBytes()/item.getTotalBytes())*100);
              this.progress.percentage += '%'; 
            }
          }
        });

        item.once('done', (event, state) => {
          if (state === 'completed') {
            this.progress.status = "Download Complete";
            console.log('Download successfully')
          } else {
            this.progress.status = "Download Failed";
            console.log(`Download failed: ${state}`)
          }
        })
      });
   }
  }

  ngOnChanges(changes:any){
    if(changes.isHidden.currentValue) this.audioElement?.pause();
  }

  ngOnDestroy(){
    this.audioElement?.pause();
  }
}
