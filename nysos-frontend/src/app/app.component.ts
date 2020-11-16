import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralStateService } from './services/general-state.service';
import { LoaderService } from './services/loader/loader.service';
import { RouterListenerService } from './services/router-listener/router-listener.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    public genState: GeneralStateService,
    public loader: LoaderService
  ) {}

  @HostListener('document:keyup.escape', ['$event'])
  handleEscapeKeyDownEventTriggered(event: KeyboardEvent) {
    this.genState.escapeKeyDownEventTriggered();
  }

  @HostListener('window:keydown', ['$event'])
  handleCTRLGPressed($event: KeyboardEvent) {
    if (
      ($event.ctrlKey || $event.metaKey) &&
      $event.altKey &&
      $event.key.toLowerCase() == 'g'
    ) {
      // CTRL + ALT + D
      this.genState.ctrlAltGKeyUpEventTriggered();
      $event.preventDefault();
    } else if (
      ($event.ctrlKey || $event.metaKey) &&
      $event.key.toLowerCase() == 'd'
    ) {
      // CTRL + D
      this.genState.ctrlDKeyUpEventTriggered();
      $event.preventDefault();
    } else if (
      ($event.ctrlKey || $event.metaKey) &&
      $event.key.toLowerCase() == 'g'
      // CTRL + G
    ) {
      this.genState.ctrlgKeyUpEventTriggered();
      $event.preventDefault();
    } else if (
      ($event.ctrlKey || $event.metaKey) &&
      $event.key.toLowerCase() == 'p'
      // CTRL + P
    ) {
      this.genState.openSearchBarClicked();
      $event.preventDefault();
    }
  }
}
