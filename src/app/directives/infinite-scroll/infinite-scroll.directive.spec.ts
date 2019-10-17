import { ViewContainerRef, TemplateRef, IterableDiffers } from '@angular/core';
import { InfiniteScrollDirective } from './infinite-scroll.directive';

describe('InfiniteScrollDirective', () => {
  const viewContainerRef: ViewContainerRef = undefined;
  const templateRef: TemplateRef<any> = undefined;
  const iterableDiffers: IterableDiffers = undefined;

  it('should create an instance', () => {
    const directive = new InfiniteScrollDirective(viewContainerRef, templateRef, iterableDiffers);
    expect(directive).toBeTruthy();
  });
});
