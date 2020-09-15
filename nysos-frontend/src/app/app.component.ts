import { Component, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';
import { CytostateService } from './services/cytostate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'nysos-frontend';
  cy: cytoscape.Core;

  constructor(private cytostate: CytostateService) {}

  ngOnInit() {
    this.cytostate.setCytocoreId('cy');
  }

  edgeCreationMode(): boolean {
    return this.cytostate.addedgemode;
  }
  activateEdgeCreation() {
    this.cytostate.edgeCreationMode();
  }
}
