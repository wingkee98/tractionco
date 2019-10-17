import { async, TestBed } from '@angular/core/testing';
import { ElementRef, Injectable } from '@angular/core';

import { SmartScrollDirective } from './smart-scroll.directive';

@Injectable()
export class MockElementRef {
  nativeElement: {};
}

describe('SmartScrollDirective', () => {
  let elRef: ElementRef;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: new MockElementRef() }
      ]
    })
    .compileComponents();

    elRef = TestBed.get(ElementRef);
  }));

  it('should create an instance', () => {
    const directive = new SmartScrollDirective(elRef);
    expect(directive).toBeTruthy();
  });
});
