import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
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
export class AppComponent implements OnInit, AfterViewInit {
  title = 'nysos-frontend';
  documentStateObs: Observable<DocumentDataStateInterface>;
  large: Observable<boolean> = scheduled([false], null);

  contentChangesObs: Observable<ContentChangesInterface>;

  @ViewChild(MatSidenav)
  set sidenav(s: MatSidenav) {
    this.appstate.setSidenavRef(s);
  }

  @ViewChild('cy') cy: ElementRef;

  constructor(
    private cytostate: CytostateService,
    private appstate: AppstateService,
    private cytoDb: CytodatabaseService
  ) {}

  ngOnInit() {
    this.documentStateObs = this.appstate.documentStateObservable;
    this.contentChangesObs = this.cytoDb.contentChangesObs;
    this.large = this.appstate.UIstateObservable.pipe(
      map((uistate) => uistate.addingDocument || uistate.editDocument)
    );
  }

  ngAfterViewInit() {
    this.cytostate.setCytocoreId('cy');
  }

  edgeCreationMode(): boolean {
    return this.cytostate.addedgemode;
  }
  activateEdgeCreation() {
    this.cytostate.edgeCreationMode();
  }

  deleteAllMyRemoteDataClicked() {
    confirm('Are you sure ?') && this.cytoDb.deleteAllMyRemoteData();
  }

  deleteAllMyLocalClicked() {
    confirm('Are you sure ?') && this.cytoDb.deleteAllMyLocalData();
  }

  addThemeClicked() {
    this.cytostate.addNode();
  }

  fitToScreenClicked() {
    this.cytostate.cytocore.fit(undefined, 100);
  }
}
