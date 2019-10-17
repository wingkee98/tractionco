import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ClusterField } from '../../../../../../constant/cluster/cluster-fields.constant';
import { ClusterConfigConstant } from '../../../../../../constant/cluster/cluster-config.constant';
import { Configuration } from '../../../../../../models/configuration.model';
import { ConfigurationStatus } from '../../../../../../constant/configuration-status.constant';
import { Observable } from 'rxjs';
import { Route } from '../../../../../../constant/route.constant';
import { Log } from '../../../../../../util/log.util';
import { User } from '../../../../../../models/user.model';
import { Communication } from '../../../../../../util/communication.util';

@Component({
  selector: 'app-cluster-detail',
  templateUrl: './cluster-detail.component.html',
  styleUrls: ['./cluster-detail.component.sass']
})
export class ClusterDetailComponent implements OnInit, OnDestroy {
  @Input() configuration: Configuration;
  @Input() formStateChangeObserver: Observable<any>;
  @Output() formFieldChange = new EventEmitter();

  private communication: Communication;
  date: Date;
  maxLengthOfClusterName = 20;
  configurationForm: FormGroup;
  formStateObserverSubscribe = undefined;
  users = [];
  defaultUser: string;

  constructor(private formBuilder: FormBuilder, private _http: HttpClient) {
    this.communication = new Communication(_http);
  }

  initFormValidation(): void {
    this.configurationForm = this.formBuilder.group({
      defaultConfigs: [''],
      clusterRegion: ['', Validators.required],
      clusterExpiration: ['', Validators.required],
      clusterOwner: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initFormValidation();
    this.getUsers();
    this.setTodayDate();
    this.setConfigurationForm();

    this.formStateObserverSubscribe = this.formStateChangeObserver.subscribe(event => {
      if (this.shouldDisableForm(event)) {
        this.disableConfigurationForm(true);
      }
    });
  }

  ngOnDestroy(): void {
    this.formStateObserverSubscribe.unsubscribe();
  }

  setTodayDate(): void {
    this.date = new Date();
  }

  getClusterRegions(): String[] {
    return ClusterConfigConstant.clusterRegions;
  }

  getUsers(): void {
    const body = {
      query: ''
    };

    this.communication.post(Route.API_USER, body, (success, message, data) => {
      if (!success) {
        return Log.error(message);
      }

      this.resetUsers();

      data.forEach((index, count) => {
        if (data.hasOwnProperty(count)) {
          const jsonConfig = data[count];
          const user = new User();
          user.setConfigurationFromJson(jsonConfig);

          this.addUser(user);
        }
      });

      this.defaultUser = this.users[0].name;
    });
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  resetUsers(): void {
    this.users = [];
  }

  setConfigurationForm(): void {
    this.getFormField(ClusterField.FIELD_CLUSTER_REGION).setValue(this.configuration.clusterRegion);
    this.getFormField(ClusterField.FIELD_CLUSTER_OWNER).setValue(this.configuration.clusterOwner);
    this.getFormField(ClusterField.FIELD_CLUSTER_EXPIRATION).setValue(this.configuration.clusterExpiration);
  }

  getFormField(formFieldName: string): AbstractControl {
    return this.configurationForm.get(formFieldName);
  }

  disableConfigurationForm(disable: boolean): void {
    if (disable) {
      this.configurationForm.disable();
    } else {
      this.configurationForm.enable();
    }
  }

  getDetailsFromForm(): Configuration {
    const configuration = new Configuration();
    configuration.clusterRegion = this.getFormField(ClusterField.FIELD_CLUSTER_REGION).value;
    configuration.clusterOwner = this.getFormField(ClusterField.FIELD_CLUSTER_OWNER).value;
    configuration.clusterExpiration = this.getFormField(ClusterField.FIELD_CLUSTER_EXPIRATION).value;

    return configuration;
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
