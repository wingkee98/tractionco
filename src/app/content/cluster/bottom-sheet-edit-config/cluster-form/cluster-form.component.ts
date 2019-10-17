import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { Configuration } from '../../../../../models/configuration.model';
import { Observable } from 'rxjs';
import { ClusterConfigComponent } from './cluster-config/cluster-config.component';
import { ClusterDetailComponent } from './cluster-detail/cluster-detail.component';

@Component({
  selector: 'app-cluster-form',
  templateUrl: './cluster-form.component.html',
  styleUrls: ['./cluster-form.component.sass', '../bottom-sheet-edit-config.component.sass']
})

export class ClusterFormComponent implements OnInit {
  @ViewChild(ClusterConfigComponent) childFormConfig: ClusterConfigComponent;
  @ViewChild(ClusterDetailComponent) childFormDetail: ClusterDetailComponent;

  @Input() configuration: Configuration;
  @Input() formStateChangeObserver: Observable<any>;
  @Output() formFieldChange = new EventEmitter();

  public onFormStateChanged = new EventEmitter<any>();

  ngOnInit(): void {
    this.formStateChangeObserver.subscribe(event => {
      this.onFormStateChanged.emit(event);
    });
  }

  onFormFieldChange(event: any): void {
    this.formFieldChange.emit(event);
  }

  getConfigForm(forCreatingCluster: boolean): Configuration {
    const configurationFormSegment = this.childFormConfig.getConfigurationFromForm(forCreatingCluster);
    const detailFormSegment = this.childFormDetail.getDetailsFromForm();

    this.configuration.clusterName = detailFormSegment.clusterName;
    this.configuration.clusterRegion = detailFormSegment.clusterRegion;
    this.configuration.clusterOwner = detailFormSegment.clusterOwner;
    this.configuration.clusterExpiration = detailFormSegment.clusterExpiration;

    this.configuration.client = configurationFormSegment.client;
    this.configuration.server = configurationFormSegment.server;
    this.configuration.serviceInstanceCounts = configurationFormSegment.serviceInstanceCounts;
    this.configuration.logMessages = configurationFormSegment.logMessages;

    return this.configuration;
  }

}
