import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ConfigurationDao } from '../../../../dao/configuration.dao';
import { Configuration } from '../../../../models/configuration.model';
import { ProgressComponent } from '../../../../module/progress/progress.component';
import { BottomSheetEditConfigComponent } from './bottom-sheet-edit-config.component';

describe('BottomSheetEditConfigurationComponent', () => {
  let component: BottomSheetEditConfigComponent;
  let fixture: ComponentFixture<BottomSheetEditConfigComponent>;
  const formBuilder: FormBuilder = new FormBuilder();
  const configuration = new Configuration();
  let configurationDao: ConfigurationDao;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, HttpClientModule ]
    });
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot(),
                 FormsModule,
                 ReactiveFormsModule],
      declarations: [ BottomSheetEditConfigComponent, ProgressComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        { provide: Configuration, useValue: configuration },
        { provide: ConfigurationDao, useValue: configurationDao },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
        { provide: MatBottomSheetRef, useValue: {} },
        { provide: ChangeDetectorRef, useValue: {} },
        { provide: FormBuilder, useValue: formBuilder }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    inject([HttpClient, HttpTestingController ],
      (http: HttpClient, backend: HttpTestingController) => {

      configurationDao = new ConfigurationDao(http);
      expect(configurationDao).toBeDefined();

      fixture = TestBed.createComponent(BottomSheetEditConfigComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  });

  it('should create', async() => {
    inject([HttpClient, HttpTestingController ],
      (http: HttpClient, backend: HttpTestingController) => {

      configurationDao = new ConfigurationDao(http);
      expect(component).toBeTruthy();
    });
  });
});
