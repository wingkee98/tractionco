import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigurationStatus } from '../../../../../constant/configuration-status.constant';
import { ClusterField } from '../../../../../constant/cluster/cluster-fields.constant';
import { Configuration } from '../../../../../models/configuration.model';

@Component({
  selector: 'app-cluster-status',
  templateUrl: './cluster-status.component.html',
  styleUrls: ['./cluster-status.component.sass']
})
export class ClusterStatusComponent implements OnInit, OnDestroy {
  @Input() configuration: Configuration;
  @Input() formFieldChangeObserver: Observable<any>;

  formFieldChangeSubscribeEvent = undefined;

  ngOnInit(): void {
    this.formFieldChangeSubscribeEvent = this.formFieldChangeObserver.subscribe(event => {
      if (this.didClusterNameChange(event.fieldName)) {
        this.configuration.clusterName = event.fieldValue;
      }
    });
  }

  ngOnDestroy(): void {
    this.formFieldChangeSubscribeEvent.unsubscribe();
  }

  getClusterName(): string {
    return this.configuration.clusterName;
  }

  didClusterNameChange(fieldName: string): boolean {
    return ClusterField.FIELD_CLUSTER_NAME === fieldName;
  }

  shouldDisplayUrl(): boolean {
    return this.configuration.status === ConfigurationStatus.STARTED;
  }

  getFrontendUrl(): string {
    return 'http://frontend.' + this.getClusterName() + '.peernova.io';
  }

  getWorkbenchUrl(): string {
    return this.getFrontendUrl() + ':4400';
  }

  getNomadUrl(): string {
    return 'http://nomad.' + this.getClusterName() + '.peernova.io:3000/nomad/global/cluster';
  }

  getGatewayUrl(): string {
    return 'https://gateway.' + this.getClusterName() + '.peernova.io:9710/api/doc/';
  }
}
