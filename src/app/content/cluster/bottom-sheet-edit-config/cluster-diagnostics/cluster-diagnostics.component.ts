import { Component } from '@angular/core';

@Component({
  selector: 'app-cluster-diagnostics',
  templateUrl: './cluster-diagnostics.component.html',
  styleUrls: ['./cluster-diagnostics.component.sass', '../bottom-sheet-edit-config.component.sass']
})
export class ClusterDiagnosticsComponent {
  isFullScreen = false;

  onFullScreen(): void {
    this.isFullScreen = true;
  }

  onFullScreenExit(): void {
    this.isFullScreen = false;
  }

}
