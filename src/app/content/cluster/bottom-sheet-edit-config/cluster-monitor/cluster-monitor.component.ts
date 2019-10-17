import { Component } from '@angular/core';

@Component({
  selector: 'app-cluster-monitor',
  templateUrl: './cluster-monitor.component.html',
  styleUrls: ['./cluster-monitor.component.sass', '../bottom-sheet-edit-config.component.sass']
})
export class ClusterMonitorComponent {
  isFullScreen = false;

  onFullScreen(): void {
    this.isFullScreen = true;
  }

  onFullScreenExit(): void {
    this.isFullScreen = false;
  }

}
