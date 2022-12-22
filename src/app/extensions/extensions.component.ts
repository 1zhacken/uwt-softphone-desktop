import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExtensionsService } from './extensions.service';
import { Extension, ExtensionStatus } from './extension';
import { PhoneControllerService } from '../phone/phone-controller.service';
import { PhoneStatusService } from '../phone/phone-status.service';

@Component({
  selector: 'uwt-extensions',
  templateUrl: './extensions.component.html',
  styleUrls: ['./extensions.component.css']
})
export class ExtensionsComponent implements OnInit {
  extensions: Extension[] = [];
  myExtension: Extension;
  show = false;

  private callInProgress = false;
  private subscriptions: Subscription[] = [];
  private transferInProgress = false;

  constructor(
    private extensionsService: ExtensionsService,
    private phoneController: PhoneControllerService,
    private phoneStatus: PhoneStatusService
  ) {}

  ngOnInit(): void {
    this.extensionsService.showExtensions$.subscribe(() => (this.show = true));
    this.extensionsService.getExtensions().subscribe((extensions) => {
      if (extensions && extensions.find((ext) => ext.isSelf)) {
        this.populateExtensions(extensions);
        this.extensionsService.emitExtensionEnabled();
        this.extensionsService.extensionStatus$.subscribe(
          this.statusHandler.bind(this)
        );
        this.extensionsService.online$.subscribe((online) => {
          if (!online) this.handleDisconnect();
          else this.extensionsService.requestGroupStatus();
        });
      }
    });
    this.phoneStatus.callInProgress$.subscribe((callInProgress) => {
      this.callInProgress = callInProgress;
    });
    this.phoneStatus.transferInProgress$.subscribe((transferInProgress) => {
      this.transferInProgress = transferInProgress;
    });
  }

  call(extension: Extension): void {
    this.phoneController.setDisplay(extension.number);
    this.phoneController.dial();
    this.dismiss();
  }

  dismiss(): void {
    this.show = false;
  }

  displayCallButton(extension: Extension): boolean {
    return extension.status == 'available' && !this.callInProgress;
  }

  displayTransferButton(extension: Extension): boolean {
    return (
      extension.status == 'available' &&
      this.callInProgress &&
      !this.transferInProgress
    );
  }

  transfer(extension: Extension): void {
    this.phoneController.transfer(extension.number);
    this.phoneStatus.setStatusMessage(`Transferring to ${extension.number}`);
    this.dismiss();
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions.length = 0;
  }

  private handleDisconnect(): void {
    this.dismiss();
    this.extensions.forEach((ext) => (ext.status = 'offline'));
    this.sortExtensions();
    this.clearSubscriptions();
  }

  private populateExtensions(extensions: Extension[]): void {
    this.extensions = [];
    extensions.forEach((ext) => {
      if (ext.isSelf) {
        this.myExtension = ext;
      } else {
        this.extensions.push(ext);
      }
    });
  }

  private sortExtensions(): void {
    this.extensions.sort((extA, extB) => {
      if (extA.status != extB.status) return extA.status > extB.status ? 1 : -1;
      else return extA.number > extB.number ? 1 : -1;
    });
  }

  private statusHandler(extStatus: ExtensionStatus): void {
    const extension = this.extensions.find(
      (ext) => ext.number == extStatus.number
    );
    if (extension) {
      extension.status = extStatus.status;
    }
    this.sortExtensions();
  }
}
