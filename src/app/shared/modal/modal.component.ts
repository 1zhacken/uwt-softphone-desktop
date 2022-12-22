import { Component, OnInit } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'uwt-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  show = false;

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.showModal$.subscribe(() => {
      this.show = true;
    });
  }

  dismiss(): void {
    this.show = false;
    this.modalService.dismiss();
  }

  selectOption(i: number): void {
    this.show = false;
    this.modalService.selectOption(i);
  }
}
