import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { EdgeCollection } from 'cytoscape';
import { Observable } from 'rxjs';
import { Color } from '../interface/common/color-picker/color-picker.component';
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
    const keys = this.cytoState
      .getThemeNodes()
      .map((node) => ({ ...node.data() }));
    const optionSelected = (id: string) => {
      const data = this.cytoState.getThemeNodes().getElementById(id).data();
      this.appState.contentSelected(data.id, data.name);
      this.appState.closeSearchBar();
    };
    this.appState.openSearchBar(keys, optionSelected);
  };

  colorSelected = (color: Color) =>
    this.cytoState.setColor(this.appState.documentState.contentId, color);
}
