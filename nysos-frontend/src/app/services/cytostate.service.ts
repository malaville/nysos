import { Injectable } from '@angular/core';
import { Core, EdgeHandlesApi, Ext } from 'cytoscape';
import { defaults } from './edgehandlesdefault';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { styles } from './cytostyles';
import { edgehandlestyles } from './edgehandlesstyles';

@Injectable({
  providedIn: 'root',
})
export class CytostateService {
  cytocore: Core;
  edgehandles: EdgeHandlesApi;
  hoverednode: boolean = false;
  addedgemode: boolean = false;

  constructor() {}

  setCytocoreId(id: string) {
    // @ts-ignore
    cytoscape.use(edgehandles);
    this.cytocore = cytoscape({
      container: document.getElementById('cy'),
      style: [...styles, ...edgehandlestyles],
    });

    this.edgehandles = this.cytocore.edgehandles(defaults);

    this.cytocore.on('mouseover', 'node', (edge) => {
      this.hoverednode = true;
    });
    this.cytocore.on('mouseout', 'node', (edge) => {
      this.hoverednode = false;
      setTimeout(() => !this.hoverednode && this.edgehandles.hide(), 500);
    });

    this.cytocore.add({
      group: 'nodes',
      data: { weight: 75, name: 'Deep Learning' },
      position: { x: 200, y: 200 },
    });
    this.cytocore.add({
      group: 'nodes',
      data: { weight: 75, name: 'Plastique' },
      position: { x: 300, y: 200 },
    });
  }

  edgeCreationMode() {
    this.addedgemode = !this.addedgemode;
    this.addedgemode ? this.edgehandles.enable() : this.edgehandles.disable();
  }
}
