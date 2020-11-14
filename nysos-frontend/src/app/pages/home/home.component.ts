import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentDataStateInterface } from 'src/app/services/app/appstate.service';
import { ContentChangesInterface } from 'src/app/services/cytodatabase/contentChanges';
import { CytodatabaseService } from 'src/app/services/cytodatabase/cytodatabase.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { GeneralStateService } from 'src/app/services/general-state.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  title = 'nysos-frontend';
  documentStateObs: Observable<DocumentDataStateInterface>;
  large: Observable<boolean> = scheduled([false], null);
  isTest: boolean;
  contentChangesObs: Observable<ContentChangesInterface>;

  constructor(
    private cytostate: CytostateService,
    private cytoDb: CytodatabaseService,
    private genState: GeneralStateService
  ) {}

  ngOnInit() {
    this.documentStateObs = this.genState.documentStateObservable;
    this.isTest =
      window.location.hostname.includes('test') ||
      window.location.hostname.includes('stage') ||
      window.location.hostname.includes('localhost');
    this.contentChangesObs = this.cytoDb.contentChangesObs;
    this.large = this.genState.UIStateObservable.pipe(
      map((uistate) => uistate.addingDocument || uistate.editDocument)
    );
  }
  @ViewChild(MatSidenav)
  set sidenav(s: MatSidenav) {
    this.genState.setSidenavRef(s);
  }

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
