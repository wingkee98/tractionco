import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Configuration } from '../../../../../models/configuration.model';

import { ClusterStatusComponent } from './cluster-status.component';

describe('ClusterStatusComponent', () => {
  let component: ClusterStatusComponent;
  let fixture: ComponentFixture<ClusterStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ ClusterStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterStatusComponent);
    component = fixture.componentInstance;
    component.formFieldChangeObserver = new Observable();
    component.configuration = new Configuration();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
