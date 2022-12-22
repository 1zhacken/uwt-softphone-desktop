import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private dismissedModal = new Subject<void>();
  private selectedOption = new Subject<number>();
  private showModalSource = new Subject<void>();

  options: string[];
  title: string;

  showModal$ = this.showModalSource.asObservable();

  dismiss(): void {
    this.dismissedModal.next();
  }

  open(title: string, options: string[]): Promise<number> {
    this.title = title;
    this.options = options;
    this.showModalSource.next();

    return new Promise<number>((resolve, reject) => {
      this.dismissedModal.asObservable().subscribe(() => reject());
      this.selectedOption.asObservable().subscribe((option) => resolve(option));
    });
  }

  selectOption(i: number): void {
    this.selectedOption.next(i);
  }
}
