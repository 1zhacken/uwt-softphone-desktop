import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'uwt-seekbar',
  templateUrl: './seekbar.component.html',
  styleUrls: ['./seekbar.component.css']
})
export class SeekbarComponent {
  private _progress = 0;

  @Input()
  set progress(progress: number) {
    this._progress = progress;
    document.documentElement.style.setProperty('--val', `${progress}%`);
  }
  get progress(): number {
    return this._progress;
  }

  @Output() seekPosition = new EventEmitter<number>();

  seek(e: InputEvent): void {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    document.documentElement.style.setProperty('--val', `${value}%`);
    this.seekPosition.emit(value);
  }
}
