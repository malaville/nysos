import { Injectable } from '@angular/core';
import { Core, EdgeHandlesApi, Ext } from 'cytoscape';
import { defaults } from './edgehandlesdefault';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { styles } from './cytostyles';
import { edgehandlestyles } from './edgehandlesstyles';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';
import { AppstateService } from '../app/appstate.service';
import { BibliographyItem } from 'src/app/interface/source-manager/bibliography-item';
@Injectable({
  providedIn: 'root',
})
export class CytostateService {
  cytocore: Core;
  edgehandles: EdgeHandlesApi;
  hoverednode: boolean = false;
  addedgemode: boolean = false;

  constructor(
    private cyDb: CytodatabaseService,
    private appstate: AppstateService
  ) {}

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

    this.cytocore.on('click', 'node', (e) => {
      this.appstate.contentSelected(e.target.id(), e.target.data().name);
    });

    this.cytocore.on('click', 'edge', (e) => {
      const id = e.target.id();
      const { name, source, target } = e.target.data();
      this.appstate.contentSelected(id, name || '', { source, target });
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

    this.cyDb.loadFromLocalStorage(this.cytocore);
  }

  edgeCreationMode() {
    this.addedgemode = !this.addedgemode;
    this.addedgemode ? this.edgehandles.enable() : this.edgehandles.disable();
  }

  saveData() {
    this.cyDb.saveNodesAndEdges(this.cytocore.elements());
  }

  loadFromLocalStorage() {
    this.cyDb.loadFromLocalStorage(this.cytocore);
  }

  addNode() {
    this.cytocore.add({
      group: 'nodes',
      data: { name: 'New Node' },
      position: { x: 50, y: 50 },
    });
  }

  changeNodeName(newName: string) {
    const id = this.appstate.documentState.contentId;
    this.cytocore.getElementById(id).data({ name: newName });
    this.appstate.contentSelected(
      id,
      newName,
      this.cytocore.getElementById(id).data()
    );
  }

  addBibliography(biblioItem: BibliographyItem) {
    const { contentId } = this.appstate.documentState;
    this.cytocore.add({
      group: 'edges',
      data: { name: biblioItem.acronym, source: contentId, target: contentId },
    });
    console.log(this.cytocore.edges().map((node) => ({ ...node.data() })));
  }
}
