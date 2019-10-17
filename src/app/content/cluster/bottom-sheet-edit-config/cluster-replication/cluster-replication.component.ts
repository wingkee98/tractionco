import { Component } from '@angular/core';

@Component({
  selector: 'app-cluster-replication',
  templateUrl: './cluster-replication.component.html',
  styleUrls: ['./cluster-replication.component.sass', '../bottom-sheet-edit-config.component.sass']
})
export class ClusterReplicationComponent {
  isFullScreen = false;

  onFullScreen(): void {
    this.isFullScreen = true;
  }

  onFullScreenExit(): void {
    this.isFullScreen = false;
  }
}
