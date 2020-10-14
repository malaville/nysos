import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import cytoscape from 'cytoscape';
import { Observable, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AppstateService,
  DocumentDataStateInterface,
} from './services/app/appstate.service';
import { CytostateService } from './services/cytostate/cytostate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'nysos-frontend';
  cy: cytoscape.Core;
  documentStateObs: Observable<DocumentDataStateInterface>;
  large: Observable<boolean> = scheduled([false], null);

  @ViewChild(MatSidenav)
  set sidenav(s: MatSidenav) {
    this.appstate.setSidenavRef(s);
  }

  constructor(
    private cytostate: CytostateService,
    private appstate: AppstateService
  ) {}

  ngOnInit() {
    this.documentStateObs = this.appstate.documentStateObservable;
    this.large = this.appstate.UIstateObservable.pipe(
      map((uistate) => uistate.addingDocument || uistate.editDocument)
    );
    setTimeout(() => this.cytostate.setCytocoreId('cy'), 500);
  }

  edgeCreationMode(): boolean {
    return this.cytostate.addedgemode;
  }
  activateEdgeCreation() {
    this.cytostate.edgeCreationMode();
  }

  saveClicked() {
    this.cytostate.saveData();
  }

  resetClicked() {
    this.cytostate.loadFromLocalStorage();
  }

  addThemeClicked() {
    this.cytostate.addNode();
  }

  openSideNav() {
    this.appstate.sidenavref.open();
  }

  newDocumentClicked() {
    this.appstate.openNewDocument(!!this.appstate.documentState.bibliography);
  }
}
