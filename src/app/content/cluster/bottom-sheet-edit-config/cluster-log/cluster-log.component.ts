// Documentation: https://github.com/drudru/ansi_up
import { default as AnsiUp } from 'ansi_up';

import { Component, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ResizedEvent } from 'angular-resize-event/resized-event';

import { Configuration } from '../../../../../models/configuration.model';

const ID_LOG_HEADER = 'log-header',
      ID_LOG_WRAPPER = 'log-wrapper';
const OFFSET_LOG_CONTAINER_HEIGHT = 40;

@Component({
  selector: 'app-cluster-log',
  templateUrl: './cluster-log.component.html',
  styleUrls: ['./cluster-log.component.sass', '../bottom-sheet-edit-config.component.sass']
})
export class ClusterLogComponent implements AfterViewInit {
  @Input() configuration: Configuration;

  ansiUp;

  logMessageContainerHeight = 0;
  isFullScreen = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.ansiUp = new AnsiUp();
  }

  ngAfterViewInit(): void {
    this.setLogMessageContainerHeight();
    this.cdr.detectChanges();
  }

  onFullScreen(): void {
    this.isFullScreen = true;
  }

  onFullScreenExit(): void {
    this.isFullScreen = false;
  }

  onResized(event: ResizedEvent): void {
    this.setLogMessageContainerHeight();
  }

  setLogMessageContainerHeight(): void {
    const headerHeight = document.getElementById(ID_LOG_HEADER).clientHeight;
    const logContainerHeight = document.getElementById(ID_LOG_WRAPPER).clientHeight;

    this.logMessageContainerHeight = logContainerHeight - headerHeight - OFFSET_LOG_CONTAINER_HEIGHT;
  }

  getLogMessageHtml(message: string): string {
    return this.ansiUp.ansi_to_html(message);
  }
}
