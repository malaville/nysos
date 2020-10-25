import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from 'angularx-social-login';
import cytoscape from 'cytoscape';
import { Observable, scheduled } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  AppstateService,
  DocumentDataStateInterface,
} from './services/app/appstate.service';
import { ContentChangesInterface } from './services/cytodatabase/contentChanges';
import { CytodatabaseService } from './services/cytodatabase/cytodatabase.service';
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
  auth: Observable<SocialUser>;
  token: string;
  contentChangesObs: Observable<ContentChangesInterface>;

  @ViewChild(MatSidenav)
  set sidenav(s: MatSidenav) {
    this.appstate.setSidenavRef(s);
  }

  constructor(
    private cytostate: CytostateService,
    private appstate: AppstateService,
    private authService: SocialAuthService,
    private cytoDb: CytodatabaseService
  ) {}

  ngOnInit() {
    this.documentStateObs = this.appstate.documentStateObservable;
    this.contentChangesObs = this.cytoDb.contentChangesObs;
    this.large = this.appstate.UIstateObservable.pipe(
      map((uistate) => uistate.addingDocument || uistate.editDocument)
    );
    setTimeout(() => this.cytostate.setCytocoreId('cy'), 500);

    this.auth = this.authService.authState.pipe(
      tap((auth) => (this.token = auth.authToken))
    );
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

  signInWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
}
