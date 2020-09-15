import { Component, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'nysos-frontend';
  cy: cytoscape.Core;

  ngOnInit() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
    });
    this.cy.add({
      group: 'nodes',
      data: { weight: 75 },
      position: { x: 200, y: 200 },
    });
    this.cy.add({
      group: 'nodes',
      data: { weight: 75 },
      position: { x: 300, y: 200 },
    });

    this.cy.on('mouseover', 'node', (e) => {
      const { x, y } = e.target.position();
      this.cy.add({
        group: 'nodes',
        data: { weight: 75 },
        position: { x: x + 50, y: y + 50 },
      });
      console.log(e);
    });
  }
}
