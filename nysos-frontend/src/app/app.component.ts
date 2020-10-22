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

  @ViewChild(MatSidenav)
  set sidenav(s: MatSidenav) {
    this.appstate.setSidenavRef(s);
  }

  constructor(
    private cytostate: CytostateService,
    private appstate: AppstateService,
    private authService: SocialAuthService
  ) {}

  ngOnInit() {
    this.documentStateObs = this.appstate.documentStateObservable;
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

  testToken() {
    const d1 = new Date();
    fetch(`http://localhost:3000/savecontent?token=${this.token}`, {
      method: 'POST',
      mode: 'cors',
      cache: 'default',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId: 'xxxx2',
        content: 'Content of XXXX sent by client 22:13XX',
      }),
    })
      .then((resp) => {
        resp.json().then((js) => console.log(js));
        const d2 = new Date();
        console.log(d2.getTime() - d1.getTime());
      })
      .catch((err) => console.log(err));
  }
}
