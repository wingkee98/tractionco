/**
 * This structure directive infiniteScrollFor loop is capable to render infinitive items inside a div (view container).
 * However, the tradition *ngFor loop is dumping every single item from a list into a container which can cause memory
 * chaos. This directive renders only viewable items from the list at any given time. If a div container viewport can
 * view up to 30 items, this directive renders up to that amount instead of dumping all into it. When scroll up or down,
 * it renders the next set of 30 items and so on base on the position of scroll bar.
 *
 * Usage: `<div>
 *          <p *infiniteScrollFor="let item of items">
 *            {{item}}
 *          </p>
 *        </div>`
 */
import {
  Input, Directive, ViewContainerRef, OnInit, TemplateRef, DoCheck, IterableDiffers, IterableDiffer
} from '@angular/core';

const INITIAL_PRECEDING_VIEWPORT_SCROLLABLE_HEIGHT = 1;   // The initial client height of precedingViewportScrollableHeight element.
                                                          // This number must be greater than zero.
const INDEX_OF_FIRST_CONTEXT_ITEM_IN_VIEW_CONTAINER = 2;  // First item is '<p *infiniteScrollFor="let item of items">'.
                                                          // Second item is an item for precedingViewportScrollableHeight.
                                                          // The third item on is the viewable items.

@Directive({
  selector: '[appInfiniteScrollFor]'
})
export class InfiniteScrollDirective implements DoCheck, OnInit {
  @Input()
  set appInfiniteScrollForOf(list: any[]) {
    this.originalItemList = list;

    if (list) {
      this.viewableItemsList = this.iterableDiffers.find(list).create();

      // Make sure directive has init before we can render items.
      if (this.hasDirectiveInit) {
        this.renderViewableItems();
      }
    }
  }

  private templateElem: HTMLElement;
  private parentTemplateElem: HTMLElement;
  private precedingViewportScrollableHeight: HTMLElement;   // An element that lets scroller know how much it can be scrolling
                                                            // up base on its height.
  private postViewportScrollableHeight: HTMLElement;        // An element that lets scroller know how much it can be scrolling
                                                            // down base on its height.

  private originalItemList: any[] = [];
  private viewableItemsList: IterableDiffer<any>;
  private contextItemHeight: number;
  private contextItemTagName: string;

  private hasDirectiveInit = false;
  private hasRenderInit = false;

  private lastChangeTriggeredByScroll = false;

  constructor(private viewContainerRef: ViewContainerRef,
              private templateRef: TemplateRef<any>,
              private iterableDiffers: IterableDiffers) { }

  ngOnInit(): void {
    this.templateElem = this.viewContainerRef.element.nativeElement;
    this.parentTemplateElem = this.templateElem.parentElement;

    // Adding an event listener will trigger ngDoCheck whenever the event fires so we don't actually need to call performRender here.
    this.parentTemplateElem.addEventListener('scroll', () => {
      this.lastChangeTriggeredByScroll = true;
    });

    this.parentTemplateElem.addEventListener('mousewheel', () => {
      this.lastChangeTriggeredByScroll = true;
    });

    this.hasDirectiveInit = true;
  }

  ngDoCheck(): void {
    if (this.hasViewableItemsListBeenCreated()) {
      if (this.lastChangeTriggeredByScroll) {
        this.renderViewableItems();
        this.lastChangeTriggeredByScroll = false;

        return;
      }

      if (this.hasOriginalItemsListChanged()) {
        this.renderViewableItems();
      }
    }
  }

  private initViewableRenderer(): void {
    if (!this.hasTemplateItemBeenConfigured()) {
      this.initInfiniteScrollableView();
    }

    if (!this.isTemplateItemTagNameDefined()) {
      this.contextItemTagName = this.getContextItemTagName();
    }

    this.precedingViewportScrollableHeight = this.createAndInsertNewElement(this.templateElem);
    this.postViewportScrollableHeight = this.createAndInsertNewElement(<HTMLElement>this.templateElem.nextSibling);

    this.hideListElementStyleType();
    this.hasRenderInit = true;
  }

  private renderViewableItems(): void {
    if (!this.isAnyItemInList()) {
      this.cleanUpViewContainer();

      return;
    }

    if (!this.hasRenderInit) {
      this.initViewableRenderer();
    }

    const indices = this.getViewableItemsIndices();
    this.viewContainerRef.clear();
    this.insertViewableItemsToView(indices);
    this.updateViewportScrollableHeight(indices);
  }

  private getViewableItemsIndices(): any {
    const fixedScrollableHeight = this.getFixedScrollableHeight();

    return {
      begin: this.getViewableBeginIndex(fixedScrollableHeight),
      end: this.getViewableEndIndex(fixedScrollableHeight)
    };
  }

  private insertViewableItemsToView(indices: any): void {
    for (let i = indices.begin; i <= indices.end; i++) {
      this.viewContainerRef.createEmbeddedView(this.templateRef, {
        $implicit: this.originalItemList[i],
        index: i
      });
    }
  }

  private updateViewportScrollableHeight(indices: any): void {
    const itemHeight = this.getContextItemHeight();

    this.precedingViewportScrollableHeight.style.height = `${indices.begin * itemHeight}px`;
    this.postViewportScrollableHeight.style.height = `${(this.originalItemList.length - indices.end - 1) * itemHeight}px`;
  }

  private limitToRange(num: number, min: number, max: number): any {
    return Math.max(
      Math.min(num, max),
      min
    );
  }

  private isTemplateItemTagNameDefined(): boolean {
    return this.contextItemTagName !== undefined;
  }

  private isTemplateElementTagLI(): boolean {
    return this.contextItemTagName.toLowerCase() === 'li';
  }

  private isAnyItemInList(): boolean {
    return this.originalItemList.length > 0;
  }

  private hasContextItemHeightBeenSet(): boolean {
    return this.contextItemHeight && this.contextItemHeight !== INITIAL_PRECEDING_VIEWPORT_SCROLLABLE_HEIGHT;
  }

  private hasTemplateItemBeenConfigured(): boolean {
    return this.isTemplateItemTagNameDefined();
  }

  private hasViewableItemsListBeenCreated(): boolean {
    return this.viewableItemsList && Array.isArray(this.originalItemList);
  }

  private hasOriginalItemsListChanged(): boolean {
    return this.viewableItemsList.diff(this.originalItemList) !== null;
  }

  private cleanUpViewContainer(): void {
    this.viewContainerRef.clear();

    if (this.hasRenderInit) {
      this.precedingViewportScrollableHeight.style.height = '0';
      this.postViewportScrollableHeight.style.height = '0';
    }
  }

  doesElementHaveAttributes(elementRef: any): boolean {
    return (elementRef && elementRef.attributes);
  }

  private initInfiniteScrollableView(): void {
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      $implicit: this.originalItemList[0],
      index: 0
    });
  }

  private getContextItemTagName(): string {
    let templateSiblingElem: HTMLElement;
    templateSiblingElem = <HTMLElement>this.templateElem.nextSibling;

    return templateSiblingElem.tagName;
  }

  private getContextItemHeight(): number {
    if (!this.hasContextItemHeightBeenSet()) {
      const firstContextItem = document.getElementsByTagName(this.contextItemTagName)[INDEX_OF_FIRST_CONTEXT_ITEM_IN_VIEW_CONTAINER];

      if (firstContextItem) {
        this.contextItemHeight = firstContextItem.clientHeight > 0 ?
                                  firstContextItem.clientHeight : INITIAL_PRECEDING_VIEWPORT_SCROLLABLE_HEIGHT;
      }
    }

    return this.contextItemHeight;
  }

  /**
   * Get the height of anything inside the container but above this infiniteScrollFor content.
   */
  private getFixedScrollableHeight(): number {
    return (this.precedingViewportScrollableHeight.getBoundingClientRect().top - this.precedingViewportScrollableHeight.scrollTop) -
            (this.parentTemplateElem.getBoundingClientRect().top - this.parentTemplateElem.scrollTop);
  }

  private getViewableBeginIndex(fixedScrollHeight: number): number {
    const scrollTop = this.parentTemplateElem.scrollTop;
    const index = Math.floor((scrollTop - fixedScrollHeight) / this.getContextItemHeight());

    return this.limitToRange(index, 0, this.originalItemList.length);
  }

  private getViewableEndIndex(fixedScrollableHeight: number): number {
    const listHeight = this.parentTemplateElem.clientHeight;
    const scrollTop = this.parentTemplateElem.scrollTop;
    const index = Math.ceil((scrollTop - fixedScrollableHeight + listHeight) / this.getContextItemHeight());

    return this.limitToRange(index, -1, this.originalItemList.length - 1);
  }

  private createAndInsertNewElement(insertBeforeElement: HTMLElement): HTMLElement {
    const element = document.createElement(this.contextItemTagName);
    this.templateElem.parentElement.insertBefore(element, insertBeforeElement);

    return element;
  }

  /**
   * Hide the list style type for <li> element for case user might use such element to list their items.
   */
  private hideListElementStyleType(): void {
    if (this.isTemplateElementTagLI()) {
      this.precedingViewportScrollableHeight.style.listStyleType = 'none';
      this.postViewportScrollableHeight.style.listStyleType = 'none';
    }
  }
}
