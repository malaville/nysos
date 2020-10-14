import { Injectable } from '@angular/core';
import { Core, EdgeHandlesApi, Ext } from 'cytoscape';
import { defaults } from './edgehandlesdefault';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { DOCUMENT_EDGE, styles } from './cytostyles';
import { edgehandlestyles } from './edgehandlesstyles';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';
import { AppstateService } from '../app/appstate.service';
import { BibliographyItem } from 'src/app/interface/source-manager/bibliography-item';

enum EDGE_TYPES {
  IDEA_LINK = 'IDEA_LINK',
  DOCUMENT_ON_THEME = 'DOCUMENT_LINK',
  DOCUMENT_BETWEEN_THEMES = 'DOCUMENT_BETWEEN_THEME',
}

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
      this.selectContent(id);
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
    this.cytocore.reset();
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
    const source = contentId;
    const target = contentId;
    this.cytocore.add({
      group: 'edges',
      classes: DOCUMENT_EDGE,
      data: {
        name: biblioItem.acronym,
        source,
        target,
        type: EDGE_TYPES.DOCUMENT_ON_THEME,
        title: biblioItem.title,
        author: biblioItem.author,
        year: biblioItem.year,
        link: biblioItem.link,
      },
    });
    this.appstate.closeNewDocument();
  }

  modifyBibliography(id: string, biblioItem: BibliographyItem) {
    const edgeData = biblioItem.toEdgeData();
    const edgeDataModified = this.cytocore.getElementById(id).data(edgeData);

    this.appstate.contentSelected(
      id,
      edgeDataModified.data().name,
      edgeDataModified.data(),
      BibliographyItem.fromEdge(edgeDataModified)
    );
  }

  findBibliographyAbout(id: string) {
    if (this.cytocore) {
      if (this.cytocore.getElementById(id).isNode()) {
        return this.cytocore
          .getElementById(id)
          .neighborhood()
          .filter(
            (ele) =>
              ele.isEdge() && ele.data().type == EDGE_TYPES.DOCUMENT_ON_THEME
          )
          .map((edge) => {
            return BibliographyItem.fromEdge(edge);
          });
      } else {
        const bibs = this.cytocore
          .elements(`edge[source = "${id}"]`)
          .map((edge) => {
            return BibliographyItem.fromEdge(edge);
          });
        return bibs;
      }
    }
  }

  findBibliographyById(id: string) {
    const bibliography = this.cytocore?.getElementById(id);
    if (bibliography) {
      return BibliographyItem.fromEdge(bibliography);
    }
    return new BibliographyItem();
  }

  selectContent(id: string) {
    const targetNode = this.cytocore.getElementById(id);
    const { name, source, target } = targetNode.data();
    if (targetNode.data().type == EDGE_TYPES.DOCUMENT_ON_THEME) {
      const { title, link, author, year } = targetNode.data();
      const bib = new BibliographyItem(title, link, name, author, year);
      this.appstate.contentSelected(id, name || '', { source, target }, bib);
    } else {
      this.appstate.contentSelected(id, name || '', { source, target });
    }
  }
}
