import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material';
import { Configuration } from '../../../models/configuration.model';
import { ConfigurationDao } from '../../../dao/configuration.dao';
import { BottomSheetEditConfigComponent } from './bottom-sheet-edit-config/bottom-sheet-edit-config.component';

@Component({
  selector: 'app-clusters',
  templateUrl: './clusters.component.html',
  styleUrls: ['./clusters.component.sass']
})
export class ClustersComponent {
  configurations: Configuration[] = [];

  private configurationDao: ConfigurationDao;

  constructor(private http: HttpClient, private bottomSheet: MatBottomSheet) {
    this.configurationDao = new ConfigurationDao(this.http);

    this.getClusters();
  }

  openBottomSheetToEditConfiguration(configurationIndex: number, configuration: Configuration): void {
    const bottomSheetRef = this.bottomSheet.open(BottomSheetEditConfigComponent, {
        data: { index: configurationIndex,
                configuration: configuration,
                configurationDao: this.configurationDao }
    });

    bottomSheetRef.instance.onConfigurationAdded.subscribe((config) => {
      this.addConfiguration(config);
    });

    bottomSheetRef.instance.onConfigurationDeleted.subscribe((index) => {
      this.getClusters();
    });

    bottomSheetRef.afterDismissed().subscribe(() => {
      this.configurationDao.removeChangeDetector();
    });
  }

  getClusters(): void {
    // TODO: NEED TO IMPLEMENT A REAL SEARCH IN THE UI.
    this.configurationDao.getClusters('', (configurations) => {
      this.resetConfigurations();

      this.addConfigurations(configurations);
    });
  }

  addConfiguration(configuration: Configuration): void {
    this.configurationDao.getConfigurationStatus(configuration);
    this.configurationDao.getConfigurationMessages(configuration);

    this.configurations.push(configuration);
  }

  addConfigurations(configurations: Configuration): void {
    this.configurations = this.configurations.concat(configurations);
  }

  resetConfigurations(): void {
    this.configurations = [];
  }

  shouldDisplayClusterTable(): boolean {
    return this.configurations !== undefined && this.configurations.length > 0;
  }
}
