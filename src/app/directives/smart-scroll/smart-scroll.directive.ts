/**
 * This directive automatically scrolls to the bottom of the div (view container) as default when data
 * is added. However, if user scrolls up (out of the bottom), viewer stops scrolling.
 *
 * Usage: Simply add this attribute directive to the view container div
 *
 *        `<div smartScroll>
 *           <div *ngFor="let item of items"> OR <div *appInifiniteScrollFor="let item of items">
 *             {{item}}
 *           </div>
 *         </div>`
 */
import { Directive, HostListener, ElementRef, DoCheck } from '@angular/core';

const NEUTRAL_SCROLL_BAR_POSITION = 0;
const APP_INFINITE_SCROLL_ATTRIBUTE_NAME = 'app-infinite-scroll-for';   // appInfiniteScrollFor directive name
const FIRST_SCROLLABLE_ITEM_INDEX_IN_VIEWPORT = 1;

@Directive({
  selector: '[smartScroll]'
})
export class SmartScrollDirective implements DoCheck {
  private templateElem: HTMLElement;
  private templateChildElemClientHeight = undefined;
  private scrollBarBottomOffset: number = NEUTRAL_SCROLL_BAR_POSITION;

  @HostListener('scroll') onScroll(): void {
    this.setScrollBarYCoordinateToBottom();
  }

  @HostListener('mousewheel', ['$event']) onmousewheel(event: WheelEvent): void {
    // Wheel up is negative and down is positive number.
    this.scrollBarBottomOffset = event.deltaY > NEUTRAL_SCROLL_BAR_POSITION ?
          NEUTRAL_SCROLL_BAR_POSITION : this.templateChildElemClientHeight;
  }

  constructor(el: ElementRef) {
    this.templateElem = el.nativeElement;
  }

  ngDoCheck(): void {
    if (this.doesTemplateElemChildExist()) {
      // We want to ensure the margins and padding are included to the height.
      // So we want to double the height to be saved.
      this.templateChildElemClientHeight = this.getTemplateChildElemClientHeight();
      this.scrollBarBottomOffset = this.templateChildElemClientHeight;
    }

    this.setScrollBarYCoordinateToBottom();
  }

  setScrollBarYCoordinateToBottom(): void {
    if (this.isScrollBarOnTheBottom()) {
      this.templateElem.scrollTop = this.templateElem.scrollHeight;
    }
  }

  getTemplateChildElemClientHeight(): any {
    const templateChildElem = this.isInfiniteScrollUsed() ?
                              this.templateElem.children[FIRST_SCROLLABLE_ITEM_INDEX_IN_VIEWPORT] :
                              this.templateElem.firstElementChild;

    return templateChildElem ? templateChildElem.clientHeight * 2 : undefined;
  }

  doesTemplateElemChildExist(): any {
    return !this.templateChildElemClientHeight && this.templateElem.firstElementChild;
  }

  isScrollBarOnTheBottom(): boolean {
    return this.templateElem.scrollHeight - this.templateElem.scrollTop <= this.templateElem.clientHeight + this.scrollBarBottomOffset;
  }

  isInfiniteScrollNode(node: Node): boolean {
    return node.nodeValue && node.nodeValue.indexOf(APP_INFINITE_SCROLL_ATTRIBUTE_NAME) > 0;
  }

  isInfiniteScrollUsed(): boolean {
    for (let i = 0; i < this.templateElem.childNodes.length; i++) {
      const node = this.templateElem.childNodes[i];

      if (this.isInfiniteScrollNode(node)) {
        return true;
      }
    }

    return false;
  }
}
