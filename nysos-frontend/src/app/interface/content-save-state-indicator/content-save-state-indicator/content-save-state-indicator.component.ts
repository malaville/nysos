import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ContentSaveStateInterface,
  CytodatabaseService,
} from 'src/app/services/cytodatabase/cytodatabase.service';

@Component({
  selector: 'app-content-save-state-indicator',
  templateUrl: './content-save-state-indicator.component.html',
  styleUrls: ['./content-save-state-indicator.component.css'],
})
export class ContentSaveStateIndicatorComponent implements OnInit {
  public contentSaveState: Observable<ContentSaveStateInterface>;
  constructor(private cytoDb: CytodatabaseService) {}

  ngOnInit(): void {
    this.contentSaveState = this.cytoDb.contentSaveStateObs;
  }
}
