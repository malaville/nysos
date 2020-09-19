import { Injectable } from '@angular/core';
import { Core, EdgeHandlesApi, Ext } from 'cytoscape';
import { defaults } from './edgehandlesdefault';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { styles } from './cytostyles';
import { edgehandlestyles } from './edgehandlesstyles';
const CYTOSAVE_KEY = 'cytosave';
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

    this.cytocore.on('data', (e) => {
      this.saveData();
    });

    this.edgehandles = this.cytocore.edgehandles(defaults);
    this.edgehandles.disable();

    this.cytocore.on('mouseover', 'node', (edge) => {
      this.hoverednode = true;
    });
    this.cytocore.on('mouseout', 'node', (edge) => {
      this.hoverednode = false;
      setTimeout(() => !this.hoverednode && this.edgehandles.hide(), 500);
    });

    this.loadFromLocalStorage();
  }

  edgeCreationMode() {
    this.addedgemode = !this.addedgemode;
    this.addedgemode ? this.edgehandles.enable() : this.edgehandles.disable();
  }

  saveData() {
    localStorage.setItem(
      CYTOSAVE_KEY,
      JSON.stringify(this.cytocore.elements().jsons())
    );
  }

  loadFromLocalStorage(): boolean {
    const cytosave = localStorage.getItem(CYTOSAVE_KEY);
    if (cytosave) {
      this.cytocore.elements().remove();
      this.cytocore.add(JSON.parse(cytosave));
      return true;
    }
    return false;
  }

  addNode() {
    this.cytocore.add({
      group: 'nodes',
      data: { name: 'New Node' },
      position: { x: 50, y: 50 },
    });
  }
}
