import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const domain:string = 'https://globalcallforwarding.com/softphone-updater/';

@Injectable({
  providedIn: 'root'
})



export class UpdateService {
    private host:any;
    update = new Subject();

    constructor(private http:HttpClient){
        if ((<any>window).require) {
            try {
              let {process, app} = (<any>window).require('electron').remote;
              this.host = {
                  platform:process.platform,
                  version:app.getVersion()
              }
              this.getLatest();
            } catch (error) {
              throw error
            }
          } else {
            //console.log('Could not load electron')
          }
    }


    getLatest(){
        const killcache = new Date().getTime();
        const url = domain + '?time=' + killcache;
        this.http.get(url).subscribe((o:any)=>{
            this.validateUpdate(o);
        },(error:any)=>{
            console.log('Error: retreiving dialerupdate file');
        });
    }
    
    validateUpdate(o:any){
        if(o.latest){            
            if(o.latest[this.host.platform]){  
                const platformUpdate = o.latest[this.host.platform]
                if(platformUpdate){
                    const latestVersion = platformUpdate.version.replace(/\./g,'');
                    const currentVersion = this.host.version.replace(/\./g,'');                    
                    if(latestVersion>currentVersion) this.processUpdate(platformUpdate);
                }else{
                    console.log('No version found in update file');
                }
            }else{
                console.log("Can't find platform in update file:" + this.host.platform);
            }
        }else{
            console.log("Reading update file");
        }
    }

    processUpdate(o:any){
        this.update.next(o);
    }
    
}
