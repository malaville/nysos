import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import {
  AppstateService,
  DocumentDataStateInterface,
  UIStateInterface,
} from './app/appstate.service';
import { CytodatabaseService } from './cytodatabase/cytodatabase.service';
import { CytostateService } from './cytostate/cytostate.service';

@Injectable({
  providedIn: 'root',
})
export class GeneralStateService {
  readonly documentStateObservable: Observable<DocumentDataStateInterface>;
  readonly UIStateObservable: Observable<UIStateInterface>;
  constructor(
    private appState: AppstateService,
    private cytoState: CytostateService,
    private dbState: CytodatabaseService
  ) {
    this.documentStateObservable = this.appState.documentStateObservable;
    this.UIStateObservable = this.appState.UIstateObservable;
  }

  // AppState Only Methods
  public setSidenavRef = (s: MatSidenav) => this.appState.setSidenavRef(s);

  //
  toggleGroupingMode = () => {
    this.appState.openGroupingMode(this.cytoState.getThemeNodes());
  };
}
