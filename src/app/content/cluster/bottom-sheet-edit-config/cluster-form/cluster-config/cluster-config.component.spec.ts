import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule, MatInputModule } from '@angular/material';
import { Observable } from 'rxjs';
import { ClusterConfiguration } from '../../../../../../models/configuration-cluster.model';
import { Configuration } from '../../../../../../models/configuration.model';

import { ClusterConfigComponent } from './cluster-config.component';

describe('ClusterConfigComponent', () => {
  let component: ClusterConfigComponent;
  let fixture: ComponentFixture<ClusterConfigComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot(),
                  FormsModule,
                  MatSelectModule,
                  MatInputModule,
                  BrowserAnimationsModule,
                  ReactiveFormsModule],
      declarations: [ ClusterConfigComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        { provide: FormBuilder, useValue: formBuilder }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterConfigComponent);
    component = fixture.componentInstance;
    component.configuration = new Configuration();
    component.configuration.server = new ClusterConfiguration('', 0);
    component.configuration.client = new ClusterConfiguration('', 0);
    component.formStateChangeObserver = new Observable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
