import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[uwtAutoFocus]'
})
export class AutoFocusDirective {
  public constructor(el: ElementRef) {
    setTimeout(() => el.nativeElement.focus());
  }
}
