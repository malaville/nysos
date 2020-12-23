import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ContentSaveStateInterface,
  CytodatabaseService,
} from 'src/app/services/cytodatabase/cytodatabase.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';

@Component({
  selector: 'app-content-save-state-indicator',
  templateUrl: './content-save-state-indicator.component.html',
  styleUrls: ['./content-save-state-indicator.component.css'],
})
export class ContentSaveStateIndicatorComponent implements OnInit {
  public contentSaveState: ContentSaveStateInterface;
  public retrying = false;

  @Input() showProgress: boolean = false;

  constructor(
    private cytoDb: CytodatabaseService,
    private cytoState: CytostateService
  ) {}

  ngOnInit(): void {
    this.cytoDb.contentSaveStateObs.subscribe(
      (contentSaveState) => (this.contentSaveState = contentSaveState)
    );
  }

  retryClicked() {
    this.retrying = true;
    this.cytoState.restartStartUp().then(() => (this.retrying = false));
  }
}
