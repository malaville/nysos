import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { Observable, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentDataStateInterface } from 'src/app/services/app/appstate.service';
import { CytodatabaseService } from 'src/app/services/cytodatabase/cytodatabase.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { GeneralStateService } from 'src/app/services/general-state.service';
import { ShareLocalDatabaseService } from 'src/app/services/local-database/local-database.service';

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

  constructor(
    private cytostate: CytostateService,
    private cytoDb: CytodatabaseService,
    private genState: GeneralStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isTest =
      window.location.hostname.includes('test') ||
      window.location.hostname.includes('stage') ||
      window.location.hostname.includes('localhost');
    this.documentStateObs = this.genState.documentStateObservable;
    this.large = this.genState.UIStateObservable.pipe(
      map((uistate) => uistate.addingDocument || uistate.editDocument)
    );
    if (this.route.snapshot.data['graphdata']) {
      this.genState.handleGraphDataReceived(
        this.route.snapshot.data['graphdata']
      );
    }
  }

  @ViewChild(MatSidenav)
  set sidenav(s: MatSidenav) {
    this.genState.setSidenavRef(s);
  }

  @ViewChild('cy') cy;

  ngAfterViewInit() {
    this.cytostate.setCytocoreId(this.cy);
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
