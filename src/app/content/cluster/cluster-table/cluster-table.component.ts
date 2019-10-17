import { Component } from '@angular/core';
import { TableComponent } from '../../../../module/table/table.component';

@Component({
  selector: 'app-cluster-table',
  templateUrl: './cluster-table.component.html',
  styleUrls: ['./cluster-table.component.sass']
})
export class ClusterTableComponent extends TableComponent { }
