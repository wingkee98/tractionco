import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ConfigurationStatus } from '../../../../../constant/configuration-status.constant';
import { Configuration } from '../../../../../models/configuration.model';
import { DialogComponent } from '../../../../../module/dialog/dialog.component';

import { ClusterActionButtonConstant } from './cluster-action-buttons.enum';

@Component({
  selector: 'app-cluster-action-buttons',
  templateUrl: './cluster-action-buttons.component.html',
  styleUrls: ['./cluster-action-buttons.component.sass']
})
export class ClusterActionButtonsComponent implements OnInit, OnDestroy {
  @Input() configuration: Configuration;
  @Input() formFieldChangeObserver: Observable<any>;
  @Output() actionButtonClick = new EventEmitter();

  formFieldChangeSubscribe = undefined;
  isFormInvalid = true;

  constructor(private matDialogRef: MatDialog) { }

  ngOnInit(): void {
    this.formFieldChangeSubscribe = this.formFieldChangeObserver.subscribe(event => {
      this.isFormInvalid = event.isFormInvalid;
    });
  }

  ngOnDestroy(): void {
    this.formFieldChangeSubscribe.unsubscribe();
  }

  openDeleteConfirmDialog(): MatDialogRef<DialogComponent> {
    return this.matDialogRef.open(DialogComponent, {
      data: {
        title: 'DIALOG_DELETE_CLUSTER_CONFIRMATION.TITLE',
        content: 'DIALOG_DELETE_CLUSTER_CONFIRMATION.CONTENT',
        content_param: this.configuration.clusterName,
        actionButtons: {
                        negativeTextReference: 'DIALOG_DELETE_CLUSTER_CONFIRMATION.BUTTON_CANCEL',
                        positiveTextReference: 'DIALOG_DELETE_CLUSTER_CONFIRMATION.BUTTON_DELETE'
                       }
      }
    });
  }

  createConfiguration(): void {
    this.actionButtonClick.emit(ClusterActionButtonConstant.BUTTON_CREATE);
  }

  deleteConfiguration(): void {
    const deleteConfirmDialogRef = this.openDeleteConfirmDialog();

    deleteConfirmDialogRef.componentInstance.onPositiveButtonClickedEvent.subscribe(() => {
      this.actionButtonClick.emit(ClusterActionButtonConstant.BUTTON_DELETE);
    });
  }

  deployCuneiform(): void {
    this.actionButtonClick.emit(ClusterActionButtonConstant.BUTTON_DEPLOY);
  }

  startCuneiformServices(): void {
    this.actionButtonClick.emit(ClusterActionButtonConstant.BUTTON_START);
  }

  shouldCreateButtonShow(): boolean {
    return this.configuration.status === ConfigurationStatus.NEW  ||
            this.configuration.status === ConfigurationStatus.CREATING ||
            this.configuration.status === ConfigurationStatus.CREATING_ERROR;
  }

  shouldDisableCreateButton(): boolean {
    return this.configuration.status === ConfigurationStatus.CREATING || this.isFormInvalid;
  }

  shouldDeployButtonShow(): boolean {
    return this.configuration.status === ConfigurationStatus.CREATED ||
            this.configuration.status === ConfigurationStatus.DEPLOYING ||
            this.configuration.status === ConfigurationStatus.DEPLOYING_ERROR;
  }

  shouldStartServicesButtonShow(): boolean {
    return this.configuration.status === ConfigurationStatus.DEPLOYED ||
            this.configuration.status === ConfigurationStatus.UPDATED_INSTANCES ||
            this.configuration.status === ConfigurationStatus.UPDATING_INSTANCES_ERROR ||
            this.configuration.status === ConfigurationStatus.STARTING ||
            this.configuration.status === ConfigurationStatus.STARTING_ERROR;
  }

  shouldDisableDeployButton(): boolean {
    return this.configuration.status === ConfigurationStatus.DEPLOYING;
  }

  shouldDisableStartServicesButton(): boolean {
    return this.configuration.status === ConfigurationStatus.STARTING;
  }

  shouldDeleteButtonShow(): boolean {
    return !(this.configuration.status === ConfigurationStatus.NEW ||
            this.configuration.status === ConfigurationStatus.CREATING);
  }

  shouldDisableDeleteButton(): boolean {
    const config = this.configuration;
    return config.status === ConfigurationStatus.DELETING ||
            config.status === ConfigurationStatus.CREATING ||
            config.status === ConfigurationStatus.DEPLOYING ||
            config.status === ConfigurationStatus.STARTING ||
            config.status === ConfigurationStatus.DELETED ||
            config.status === undefined;
  }
}
