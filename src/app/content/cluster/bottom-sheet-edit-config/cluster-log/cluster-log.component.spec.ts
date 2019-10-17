import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollDirective } from '../../../../../directives/infinite-scroll/infinite-scroll.directive';
import { SmartScrollDirective } from '../../../../../directives/smart-scroll/smart-scroll.directive';
import { Configuration } from '../../../../../models/configuration.model';
import { SafeHtmlPipe } from '../../../../../pipes/safe-html/safe-html.pipe';

import { ClusterLogComponent } from './cluster-log.component';

describe('ClusterLogComponent', () => {
  let component: ClusterLogComponent;
  let fixture: ComponentFixture<ClusterLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ ClusterLogComponent, InfiniteScrollDirective, SmartScrollDirective, SafeHtmlPipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterLogComponent);
    component = fixture.componentInstance;
    component.configuration = new Configuration();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
