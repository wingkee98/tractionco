import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ClusterConfigConstant } from '../../../../../../constant/cluster/cluster-config.constant';
import { ClusterField } from '../../../../../../constant/cluster/cluster-fields.constant';
import { LocalizationKey } from '../../../../../../constant/cluster/localization-keys.constant';
import { ConfigurationStatus } from '../../../../../../constant/configuration-status.constant';
import { ServiceInstances } from '../../../../../../constant/service-instances.constant';
import { ClusterConfiguration } from '../../../../../../models/configuration-cluster.model';
import { Configuration } from '../../../../../../models/configuration.model';

const DEFAULT_CONFIG_BUTTON_DISABLED_CLASS = 'default-config-button-disabled';
const DEFAULT_CONFIG_BUTTON_ENABLED_CLASS = 'default-config-button-enabled';

@Component({
  selector: 'app-cluster-config',
  templateUrl: './cluster-config.component.html',
  styleUrls: ['./cluster-config.component.sass']
})
export class ClusterConfigComponent implements OnInit, OnDestroy {
  @Input() configuration: Configuration;
  @Input() formStateChangeObserver: Observable<any>;

  defaultClusterConfigLocalizationNames = [
      LocalizationKey.KEY_CONFIG_NONE,
      LocalizationKey.KEY_CONFIG_BASIC,
      LocalizationKey.KEY_CONFIG_HIGH_PERFORMANCE,
      LocalizationKey.KEY_CONFIG_VERY_HIGH_PERFORMANCE,
  ];

  configurationForm: FormGroup;
  changeEventSubscriptions = [];
  formStateObserverSubscribe = undefined;
  isFullScreen = false;

  constructor(private formBuilder: FormBuilder) { }

  public getConfigurationFromForm(forCreatingCluster: boolean): Configuration {
    const serverInstanceType = this.getFormField(ClusterField.FIELD_SERVER_INSTANCE_TYPE).value;
    const serverInstanceCount = this.getFormField(ClusterField.FIELD_SERVER_INSTANCE_COUNT).value;
    const clientInstanceType = this.getFormField(ClusterField.FIELD_CLIENT_INSTANCE_TYPE).value;
    const clientInstanceCount = this.getTotalClientInstanceCount();

    const configuration = new Configuration();
    configuration.server = new ClusterConfiguration(serverInstanceType, serverInstanceCount);
    configuration.client = new ClusterConfiguration(clientInstanceType, clientInstanceCount);
    configuration.serviceInstanceCounts = this.getServiceInstanceCountsByType(forCreatingCluster);

    return configuration;
  }

  public disableConfigurationForm(disable: boolean): void {
    if (disable) {
      this.configurationForm.disable();
    } else {
      this.configurationForm.enable();
    }
  }

  ngOnInit(): void {
    this.initFormValidation();
    this.setConfigurationForm();
    this.addFormChangeEvents();
    this.setDefaultConfigurationValues();

    this.formStateObserverSubscribe = this.formStateChangeObserver.subscribe(event => {
      if (this.shouldDisableForm(event)) {
        this.disableConfigurationForm(true);
      }
    });
  }

  ngOnDestroy(): void {
    this.formStateObserverSubscribe.unsubscribe();
  }

  initFormValidation(): void {
    this.configurationForm = this.formBuilder.group({
      defaultConfigs: [''],
      clusterRegion: ['', Validators.required],
      serverInstanceType: ['', Validators.required],
      serverInstanceCount: ['', Validators.required],
      clientInstanceType: ['', Validators.required],
      clientInstanceCount: ['', Validators.required],
      cassandraInstanceCount: ['', Validators.required],
      elasticsearchInstanceCount: ['', Validators.required],
      kafkaInstanceCount: ['', Validators.required]
    });
  }

  onFullScreen(): void {
    this.isFullScreen = true;
  }

  onFullScreenExit(): void {
    this.isFullScreen = false;
  }

  addFormChangeEvents(): void {
    for (const formControl in this.configurationForm.controls) {
      if (this.configurationForm.controls.hasOwnProperty(formControl) &&
        this.formFieldIsAllowedToChangeForm(formControl)) {
        const changeEventSubscription = this.configurationForm.controls[formControl].valueChanges.subscribe(
          () => {
            this.setDefaultConfigurationValues();
          }
        );

        this.changeEventSubscriptions.push(changeEventSubscription);
      }
    }
  }

  removeFormChangeEvents(): void {
    for (let i = 0; i < this.changeEventSubscriptions.length; i++) {
      this.changeEventSubscriptions[i].unsubscribe();
    }
  }

  defaultConfigButtonClassName(defaultConfigName: string): string {
    return  this.shouldDefaultConfigButtonDisabled(defaultConfigName) ?
            DEFAULT_CONFIG_BUTTON_DISABLED_CLASS : DEFAULT_CONFIG_BUTTON_ENABLED_CLASS;
  }

  setDefaultConfigurations(defaultConfigSelection: string): void {
    if (!this.isDefaultConfigDisabled(defaultConfigSelection)) {
      this.removeFormChangeEvents();

      this.getFormField(ClusterField.FIELD_DEFAULT_CONFIGS).setValue(defaultConfigSelection);
      const configuration = this.getConfigurationFromDefaultConfig(defaultConfigSelection);

      configuration.status = this.configuration.status;
      this.configuration = configuration;

      this.setConfigurationForm();
      this.addFormChangeEvents();
    }
  }

  setDefaultConfigurationValues(): void {
    const formConfiguration = this.getConfigurationFromForm(false);
    const highPerformanceClusterConfiguration = this.getConfigurationFromDefaultConfig(LocalizationKey.KEY_CONFIG_HIGH_PERFORMANCE);
    const veryHighPerformanceClusterConfiguration = this.getConfigurationFromDefaultConfig(
                                                        LocalizationKey.KEY_CONFIG_VERY_HIGH_PERFORMANCE);
    const basicClusterConfiguration = this.getConfigurationFromDefaultConfig(LocalizationKey.KEY_CONFIG_BASIC);

    if (formConfiguration.hasEquivalentConfigurationsTo(highPerformanceClusterConfiguration)) {
      return this.setDefaultConfigSelection(LocalizationKey.KEY_CONFIG_HIGH_PERFORMANCE);
    }

    if (formConfiguration.hasEquivalentConfigurationsTo(veryHighPerformanceClusterConfiguration)) {
      return this.setDefaultConfigSelection(LocalizationKey.KEY_CONFIG_VERY_HIGH_PERFORMANCE);
    }

    if (formConfiguration.hasEquivalentConfigurationsTo(basicClusterConfiguration)) {
      return this.setDefaultConfigSelection(LocalizationKey.KEY_CONFIG_BASIC);
    }

    return this.setDefaultConfigSelection(LocalizationKey.KEY_CONFIG_NONE);
  }

  setDefaultConfigSelection(defaultConfigSelection: LocalizationKey): void {
    this.getFormField(ClusterField.FIELD_DEFAULT_CONFIGS).setValue(defaultConfigSelection);
  }

  setConfigurationForm(): void {
    this.getInstanceCountsFields();

    this.getFormField(ClusterField.FIELD_SERVER_INSTANCE_TYPE).setValue(this.configuration.server.instanceType);
    this.getFormField(ClusterField.FIELD_SERVER_INSTANCE_COUNT).setValue(Number(this.configuration.server.count));
    this.getFormField(ClusterField.FIELD_CLIENT_INSTANCE_TYPE).setValue(this.configuration.client.instanceType);
    this.getFormField(ClusterField.FIELD_CLIENT_INSTANCE_COUNT).setValue(this.getAdditionalClientInstanceCount());
  }

  getInstanceCountsFields(): void {
    this.getFormField(ClusterField.FIELD_CASSANDRA_INSTANCE_COUNT).setValue(
                                                              this.getInstanceCountFromServiceName(ServiceInstances.CASSANDRA));
    this.getFormField(ClusterField.FIELD_ELASTICSEARCH_INSTANCE_COUNT).setValue(
                                                              this.getInstanceCountFromServiceName(ServiceInstances.ELASTICSEARCH));
    this.getFormField(ClusterField.FIELD_KAFKA_INSTANCE_COUNT).setValue(this.getInstanceCountFromServiceName(ServiceInstances.KAFKA));
  }

  getAdditionalClientInstanceCount(): Number {
    const defaultClientInstanceCount = ClusterConfigConstant.clientInstanceCounts[0];
    const additionalClientInstanceCount = Number(this.configuration.client.count) - this.getTotalClientInstanceCount();

    if (additionalClientInstanceCount < defaultClientInstanceCount) {
      return defaultClientInstanceCount;
    }

    return additionalClientInstanceCount;
  }

  getInstanceCountFromServiceName(serviceName: string): Number {
    if (!this.configuration.doesServiceInstanceCountExists(serviceName)) {
      const defaultServiceInstanceCount = ClusterConfigConstant.serviceInstanceCounts[0];
      return defaultServiceInstanceCount;
    }

    return this.configuration.serviceInstanceCounts[serviceName];
  }

  getTotalClientInstanceCount(): number {
    const cassandraInstanceCount = this.getFormField(ClusterField.FIELD_CASSANDRA_INSTANCE_COUNT).value;
    const elasticsearchInstanceCount = this.getFormField(ClusterField.FIELD_ELASTICSEARCH_INSTANCE_COUNT).value;
    const kafkaInstanceCount = this.getFormField(ClusterField.FIELD_KAFKA_INSTANCE_COUNT).value;
    const serverInstanceCount = this.getFormField(ClusterField.FIELD_SERVER_INSTANCE_COUNT).value;
    const additionalClientInstanceCount = this.getFormField(ClusterField.FIELD_CLIENT_INSTANCE_COUNT).value;

    return serverInstanceCount + cassandraInstanceCount + elasticsearchInstanceCount + kafkaInstanceCount + additionalClientInstanceCount;
  }

  getServiceInstanceCountsByType(forCreatingCluster: boolean): any {
    const instanceCounts = { };
    instanceCounts[ServiceInstances.CASSANDRA] = this.getFormField(ClusterField.FIELD_CASSANDRA_INSTANCE_COUNT).value;
    instanceCounts[ServiceInstances.ELASTICSEARCH] = this.getFormField(ClusterField.FIELD_ELASTICSEARCH_INSTANCE_COUNT).value;
    instanceCounts[ServiceInstances.KAFKA] = this.getFormField(ClusterField.FIELD_KAFKA_INSTANCE_COUNT).value;

    if (forCreatingCluster) {
      this.removeDefaultServiceInstanceCounts(instanceCounts);
    }

    return instanceCounts;
  }

  getConfigurationFromDefaultConfig(defaultConfigLocalizationKeyName: string): Configuration {
    const configuration = new Configuration();
    configuration.getDefaultConfiguration(defaultConfigLocalizationKeyName);
    return configuration;
  }

  removeDefaultServiceInstanceCounts(instanceCounts: {}): void {
    for (const serviceName in instanceCounts) {
      if (instanceCounts.hasOwnProperty(serviceName)) {
        const instanceCount = instanceCounts[serviceName];
        if (this.isServiceInstanceCountDefault(instanceCount)) {
          delete instanceCounts[serviceName];
        }
      }
    }
  }

  getFormField(formFieldName: string): AbstractControl {
    return this.configurationForm.get(formFieldName);
  }

  formFieldIsAllowedToChangeForm(formFieldName: string): boolean {
    return formFieldName !== ClusterField.FIELD_DEFAULT_CONFIGS && formFieldName !== ClusterField.FIELD_CLUSTER_NAME;
  }

  getClusterRegions(): String[] {
    return ClusterConfigConstant.clusterRegions;
  }

  getServiceInstanceCounts(): Number[] {
    return ClusterConfigConstant.serviceInstanceCounts;
  }

  getServerInstanceTypes(): String[] {
    return ClusterConfigConstant.serverInstanceTypes;
  }

  getServerClusterCounts(): Number[] {
    return ClusterConfigConstant.serverInstanceCounts;
  }

  getClientInstanceTypes(): String[] {
    return ClusterConfigConstant.clientInstanceTypes;
  }

  getClientClusterCounts(): Number[] {
    return ClusterConfigConstant.clientInstanceCounts;
  }

  shouldEnableConfigurationForm(): boolean {
    return this.configuration.status === ConfigurationStatus.NEW;
  }

  shouldDefaultConfigButtonDisabled(defaultConfigName: string): boolean {
    return !this.shouldEnableConfigurationForm() ||
           this.isDisabled(defaultConfigName) ? true : false;
  }

  isDefaultConfigDisabled(defaultConfigName: string): boolean {
    if (this.shouldEnableConfigurationForm() && !this.isDisabled(defaultConfigName)) {
      return false;
    } else {
      return true;
    }
  }

  isDisabled(defaultConfigName: string): boolean {
    return defaultConfigName === LocalizationKey.KEY_CONFIG_NONE;
  }

  isServiceInstanceCountDefault(instanceCount: number): boolean {
    return instanceCount === ServiceInstances.DEFAULT_COUNT;
  }

  shouldDisableForm(state: ConfigurationStatus): boolean {
    switch (state) {
      case ConfigurationStatus.NEW:
        return false;
      default:
        return true;
    }
  }
}
