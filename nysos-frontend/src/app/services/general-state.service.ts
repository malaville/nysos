import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SocialAuthService } from 'angularx-social-login';
import { EdgeCollection } from 'cytoscape';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HSLColor } from '../interface/common/color-picker/color-picker.component';
import {
  AppstateService,
  DocumentDataStateInterface,
  UIStateInterface,
} from './app/appstate.service';
import { ClientService } from './client/client.service';
import { fetchAllScopeData } from './cytodatabase/fetchNysosBackend';
import { CytostateService } from './cytostate/cytostate.service';
import { ScopeService } from './scope/scope.service';

@Injectable({
  providedIn: 'root',
})
export class GeneralStateService {
  readonly documentStateObservable: Observable<DocumentDataStateInterface>;
  readonly UIStateObservable: Observable<UIStateInterface>;
  constructor(
    private appState: AppstateService,
    private cytoState: CytostateService,
    private scope: ScopeService,
    private authState: SocialAuthService,
    private client: ClientService
  ) {
    this.documentStateObservable = this.appState.documentStateObservable;
    this.UIStateObservable = this.appState.UIstateObservable;
    combineLatest([this.scope.currentScope$, this.authState.authState])
      .pipe(
        switchMap(([scope, authState]) => {
          if (scope?.isShared) {
            return this.client.fetchAllScopeData(
              authState.authToken,
              scope.targetId
            );
          }
          return this.client.fetchAllData(authState.authToken);
        })
      )
      .subscribe((data) => this.cytoState.loadWithSave(data));
  }

  // AppState Only Methods
  public setSidenavRef = (s: MatSidenav) => this.appState.setSidenavRef(s);

  //
  toggleGroupingMode = () => {
    const onNewParentingRelationsArePassed = (edges: EdgeCollection) => {
      this.cytoState.importNewParentingRelations(edges);
    };
    this.appState.openGroupingMode(
      this.cytoState.getThemeNodes(),
      onNewParentingRelationsArePassed
    );
  };

  escapeKeyDownEventTriggered() {
    this.appState.closeSearchBar();
    this.appState.closeGroupingMode();
    this.appState.unselectContent();
    this.appState.closeNewDocument();
    this.appState.toggleInfoModal(true);
  }

  ctrlgKeyUpEventTriggered() {
    this.appState.unselectContent();
    !this.appState.UIstate.groupingMode && this.toggleGroupingMode();
  }

  ctrlAltGKeyUpEventTriggered = () =>
    this.cytoState.groupSeletedNodesAtAncestorLevels();

  ctrlDKeyUpEventTriggered = () => this.cytoState.deleteSelectedThemes();

  toggleInfoModal = () => this.appState.toggleInfoModal();

  openSearchBarClicked = () => {
    const keys = this.cytoState.getThemeNodes().map((node) => ({
      id: node.id(),
      name: node.data().name,
      hue: node.data().hue || node.data().inheritedHue,
    }));
    if (keys.length == 0) return;
    const optionSelected = (id: string) => {
      this.cytoState.selectElement(id);
      this.cytoState.zoomAndCenterOn(id);
      this.appState.closeSearchBar();
    };
    this.appState.openSearchBar(keys, optionSelected);
  };

  colorSelected = (elementId: string, color: HSLColor) =>
    this.cytoState.setColor(elementId, color);
}
