import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable, of, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentDataStateInterface } from './services/app/appstate.service';
import { ContentChangesInterface } from './services/cytodatabase/contentChanges';
import { CytodatabaseService } from './services/cytodatabase/cytodatabase.service';
import { CytostateService } from './services/cytostate/cytostate.service';
import { GeneralStateService } from './services/general-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'nysos-frontend';
  documentStateObs$: Observable<DocumentDataStateInterface>;
  large: Observable<boolean> = of(false);
  isTest: boolean;

  contentChangesObs: Observable<ContentChangesInterface>;

  @ViewChild(MatSidenav)
  set sidenav(s: MatSidenav) {
    this.genState.setSidenavRef(s);
  }

  @ViewChild('sidenav', { read: ElementRef }) _sidenav: ElementRef;

  @ViewChild('cy') cy: ElementRef;

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

  constructor(
    private cytostate: CytostateService,
    private cytoDb: CytodatabaseService,
    private genState: GeneralStateService
  ) {
    this.genState.documentStateObservable.subscribe((documentState) => {
      if (this._sidenav) {
        if (documentState.hue !== undefined) {
          const hslColor = `hsl( ${documentState.hue} , 50% , 70%)`;
          this._sidenav.nativeElement.style.backgroundColor = hslColor;
        } else {
          this._sidenav.nativeElement.style.backgroundColor = 'white';
        }
      }
    });
  }

  ngOnInit() {
    this.documentStateObs$ = this.genState.documentStateObservable;
    this.isTest =
      window.location.hostname.includes('test') ||
      window.location.hostname.includes('stage') ||
      window.location.hostname.includes('localhost');
    this.contentChangesObs = this.cytoDb.contentChangesObs;
    this.large = this.genState.UIStateObservable.pipe(
      map((uistate) => uistate.addingDocument || uistate.editDocument)
    );
  }

  ngAfterViewInit() {
    this.cytostate.setCytocoreId('cy');
  }

  edgeCreationMode(): boolean {
    return this.cytostate.addedgemode;
  }
  activateEdgeCreation = () => () => this.cytostate.edgeCreationMode();

  deleteAllMyRemoteDataClicked = () => () => {
    confirm('Are you sure ?') && this.cytoDb.deleteAllMyRemoteData();
  };

  deleteAllMyLocalClicked = () => () => {
    confirm('Are you sure ?') && this.cytoDb.deleteAllMyLocalData();
  };

  addThemeClicked = () => () => {
    this.cytostate.addNode();
  };

  fitToScreenClicked = () => () => {
    this.cytostate.cytocore.fit(undefined, 100);
  };

  goOfflineClicked = () => () => {
    this.cytoDb.goOffline();
  };

  groupingModeClicked = () => () => this.genState.toggleGroupingMode();

  importMyDataClicked = () => () => this.cytoDb.importMyData();

  moreInfoClicked = () => () => this.genState.toggleInfoModal();

  searchButtonClicked = () => () => this.genState.openSearchBarClicked();
}
