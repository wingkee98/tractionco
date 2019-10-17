import { Component, Inject, ChangeDetectorRef, EventEmitter, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';

import { CssClass } from '../../../../constant/class.constant';
import { RegEx } from '../../../../constant/reg-ex.constant';
import { ClusterField } from '../../../../constant/cluster/cluster-fields.constant';
import { ConfigurationStatus } from '../../../../constant/configuration-status.constant';
import { ConfigurationDao } from '../../../../dao/configuration.dao';
import { Configuration } from '../../../../models/configuration.model';
import { ClusterActionButtonConstant } from './cluster-action-buttons/cluster-action-buttons.enum';
import { ClusterFormComponent } from './cluster-form/cluster-form.component';

const STARTING_SCROLL_POSITION = 0;

@Component({
  selector: 'app-bottom-sheet-edit-config',
  templateUrl: './bottom-sheet-edit-config.component.html',
  styleUrls: ['./bottom-sheet-edit-config.component.sass']
})
export class BottomSheetEditConfigComponent implements OnInit, AfterViewInit {
  @ViewChild(ClusterFormComponent) childFormConfig: ClusterFormComponent;

  public onConfigurationAdded = new EventEmitter<Configuration>();
  public onConfigurationDeleted = new EventEmitter<number>();
  public onConfigFormChanged = new EventEmitter<any>();
  public onFormStateChanged = new EventEmitter<any>();

  maxLengthOfClusterName = 20;
  shadowClassName = '';
  clusterForm: FormGroup;
  configurationIndex: number;
  configuration: Configuration;
  configurationDao: ConfigurationDao;

  constructor(private formBuilder: FormBuilder,
              @Inject(MAT_BOTTOM_SHEET_DATA) data: {
                index: number, configuration: Configuration, configurationDao: ConfigurationDao
              },
              private changeDetector: ChangeDetectorRef,
              private bottomSheetRef: MatBottomSheetRef<BottomSheetEditConfigComponent>) {
    this.initDataModel(data, this.changeDetector);
  }

  ngOnInit(): void {
    this.initFormValidation();
    this.setFormClusterNameValue();
    this.setFormState();
  }

  ngAfterViewInit(): void {
    this.setFormState();
  }

  initFormValidation(): void {
    this.clusterForm = this.formBuilder.group({
      clusterName: ['', [Validators.required, Validators.pattern(RegEx.CLUSTER_NAME_VALID_CHARS)]],
    });
  }

  initDataModel(data: any, changeDetector: ChangeDetectorRef): void {
    this.configurationDao = data.configurationDao;

    if (this.isNewCluster(data.configuration)) {
      this.setConfigurationToDefault();
    } else {
      this.configurationIndex = data.index;
      this.configuration = data.configuration;
    }

    this.configurationDao.setChangeDetector(changeDetector);
  }

  closeBottomSheetEditConfiguration(): void {
    this.bottomSheetRef.dismiss();
  }

  setFormClusterNameValue(): void {
    this.clusterForm.get(ClusterField.FIELD_CLUSTER_NAME).setValue(this.configuration.clusterName);
  }

  setConfigurationToDefault(): void {
    const configuration = this.getConfigurationFromDefaultConfig('');
    configuration.status = ConfigurationStatus.NEW;
    configuration.clusterName = '';

    this.configuration = configuration;
  }

  getConfigurationFromDefaultConfig(defaultConfigLocalizationKeyName: string): Configuration {
    const configuration = new Configuration();
    configuration.getDefaultConfiguration(defaultConfigLocalizationKeyName);
    return configuration;
  }

  onFormFieldClusterNameChange(): void {
    this.onConfigFormChanged.emit({
      fieldName: ClusterField.FIELD_CLUSTER_NAME, fieldValue: this.getFormClusterNameValue(),
      isFormInvalid: this.clusterForm.invalid
    });

    this.configuration.clusterName = this.getFormClusterNameValue();
  }

  onFormContainerScroll(event: any): string {
    if (!this.isScrollBarAtTheTop(event.target.scrollTop)) {
      return this.shadowClassName = '';
    }

    return this.shadowClassName = CssClass.SHADOW;
  }

  setFormState(): void {
    if (!this.shouldEnableClusterForm()) {
      this.dispatchFormStateChanged(ConfigurationStatus.CREATED);
      return this.clusterForm.disable();
    }

    this.dispatchFormStateChanged(ConfigurationStatus.NEW);
    this.clusterForm.enable();
  }

  dispatchFormStateChanged(state: ConfigurationStatus): void {
    this.onFormStateChanged.emit(state);
  }

  onActionButtonClick(event: ClusterActionButtonConstant): void {
    switch (event) {
      case ClusterActionButtonConstant.BUTTON_DELETE:
        this.deleteCluster();
      break;
      case ClusterActionButtonConstant.BUTTON_CREATE:
        this.createDeployAndStartServices();
      break;
      case ClusterActionButtonConstant.BUTTON_DEPLOY:
        this.deployAndStartServices();
      break;
      case ClusterActionButtonConstant.BUTTON_START:
        this.startServices();
      break;
      default:
      break;
    }
  }

  deleteCluster(): void {
    this.configurationDao.deleteCluster(this.configuration, () => {
      this.onConfigurationDeleted.emit(this.configurationIndex);
    });
  }

  createDeployAndStartServices(): void {
    this.configuration = this.childFormConfig.getConfigForm(true);
    this.configuration.clusterName = this.getFormClusterNameValue();
    this.configurationDao.fullyCreateCluster(this.configuration);
    this.onFormStateChanged.emit(ConfigurationStatus.CREATING);
    this.onConfigurationAdded.emit(this.configuration);
    this.setFormState();
  }

  deployAndStartServices(): void {
    this.configurationDao.deployCuneiformAndStartServices(this.configuration);
  }

  startServices(): void {
    this.configurationDao.startCuneiformServices(this.configuration);
  }

  getFormClusterNameValue(): string {
    return this.clusterForm.get(ClusterField.FIELD_CLUSTER_NAME).value;
  }

  shouldDisplayLoading(): boolean {
    return this.configuration && this.configuration.shouldDisplayLoading(this.configuration);
  }

  isNewCluster(configuration: Configuration): boolean {
    return configuration === undefined || configuration === null;
  }

  isScrollBarAtTheTop(scrollPos: number): boolean {
    return scrollPos > STARTING_SCROLL_POSITION;
  }

  shouldEnableClusterForm(): boolean {
    return this.configuration.status === ConfigurationStatus.NEW;
  }
}
