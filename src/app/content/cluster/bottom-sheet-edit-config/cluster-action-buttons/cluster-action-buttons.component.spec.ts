import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { Configuration } from '../../../../../models/configuration.model';

import { ClusterActionButtonsComponent } from './cluster-action-buttons.component';

describe('ClusterActionButtonsComponent', () => {
  let component: ClusterActionButtonsComponent;
  let fixture: ComponentFixture<ClusterActionButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ ClusterActionButtonsComponent ],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: Configuration, useValue: {} },
        { provide: Observable, useValue: {} }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterActionButtonsComponent);
    component = fixture.componentInstance;
    component.configuration = new Configuration();
    component.formFieldChangeObserver = new Observable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
