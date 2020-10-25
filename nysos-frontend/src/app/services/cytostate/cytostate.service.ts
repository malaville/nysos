import { Injectable } from '@angular/core';
import { Core, EdgeHandlesApi, Ext } from 'cytoscape';
import { defaults } from './edgehandlesdefault';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { styles } from './cytostyles';
import { EDGE_TYPES, NODE_TYPES } from './models';
import { edgehandlestyles } from './edgehandlesstyles';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';
import { AppstateService } from '../app/appstate.service';
import {
  BibliographyItem,
  BibliographyItemLink,
} from 'src/app/interface/source-manager/bibliography-item';

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
      this.saveData({
        ...e.target.data(),
        position: (e.target.isNode() && e.target.position()) || undefined,
      });
    });

    // this.cytocore.on('drag', (e) => console.log('move', e.target.data()));

    this.cytocore.on('click touchend', 'node', (e) => {
      const id = e.target.id();
      this.selectContent(id);
    });

    this.cytocore.on('click touchend', 'edge', (e) => {
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
      !edge.target.data().name &&
        setTimeout(() => !this.hoverednode && this.edgehandles.hide(), 500);
    });
    this.cytocore.on(
      'mouseup',
      'node',
      (edge) => !edge.target.data().name && this.selectContent(edge.target.id())
    );

    this.cyDb.loadFromLocalStorage(this.cytocore);
  }

  edgeCreationMode() {
    this.addedgemode = !this.addedgemode;
    this.addedgemode ? this.edgehandles.enable() : this.edgehandles.disable();
  }

  saveData(data?: any) {
    data && this.cyDb.saveDataOf(data.id, data);
    this.cyDb.saveNodesAndEdges(this.cytocore.elements());
  }

  loadFromLocalStorage() {
    this.cyDb.loadFromLocalStorage(this.cytocore);
    this.cytocore.reset();
  }

  addNode(params: { parent?: string; x?: number; y?: number } = {}) {
    this.cytocore.add({
      group: 'nodes',
      data: { name: '', parent: params.parent, type: NODE_TYPES.THEME_NODE },
      position: { x: params.x || 50, y: params.y || 50 },
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
    const documentData = this.cytocore.add({
      group: 'nodes',
      classes: NODE_TYPES.DOCUMENT_NODE,
      data: {
        name: biblioItem.acronym,
        type: NODE_TYPES.DOCUMENT_NODE,
        title: biblioItem.title,
        author: biblioItem.author,
        year: biblioItem.year,
        link: biblioItem.link,
      },
    });
    this.saveData(documentData.data());
    this.addBibliographyLink(documentData.id(), contentId);

    this.appstate.refreshDocummentState();
    this.appstate.closeNewDocument();
  }

  addBibliographyLink(documentId: string, nodeOrEdgeId: string) {
    const documentAcronym = this.cytocore.getElementById(documentId).data()
      .name;
    const objectName = this.cytocore.getElementById(nodeOrEdgeId).data().name;

    let edge_type = EDGE_TYPES.DOCUMENT_ON_RELATION;
    if (this.cytocore.getElementById(nodeOrEdgeId).isNode()) {
      edge_type = EDGE_TYPES.DOCUMENT_ON_THEME;
    }

    const bibliographyObject = this.cytocore.add({
      group: 'edges',
      classes: edge_type,
      data: {
        name: `${documentAcronym} explains ${objectName}`,
        source: documentId,
        target: nodeOrEdgeId,
        type: edge_type,
      },
    });

    this.saveData(bibliographyObject.data());
  }

  modifyBibliography(id: string, biblioItem: BibliographyItem) {
    const nodeData = biblioItem.toNodeData();
    const nodeDataModified = this.cytocore.getElementById(id).data(nodeData);

    this.appstate.contentSelected(
      id,
      nodeDataModified.data().name,
      nodeDataModified.data(),
      BibliographyItem.fromNode(nodeDataModified)
    );
  }

  findBibliographyAbout(id: string) {
    if (this.cytocore) {
      if (this.cytocore.getElementById(id).isNode()) {
        const bibsLinked = this.cytocore
          .getElementById(id)
          .incomers()
          .filter(
            (ele) => ele.isNode() && ele.data().type == NODE_TYPES.DOCUMENT_NODE
          )
          .map((edge) => {
            return BibliographyItem.fromNode(edge);
          });
        return bibsLinked.map((bib) => {
          const linkBetweenBibAndObject = this.cytocore.elements(
            `edge[target = "${id}"][source = "${bib.contentId}"]`
          );

          const idOfLinkBetweenBibAndObject = linkBetweenBibAndObject.id();
          const description = this.cyDb.loadContentOf(
            idOfLinkBetweenBibAndObject
          );
          return new BibliographyItemLink(
            bib,
            description,
            idOfLinkBetweenBibAndObject
          );
        });
      } else {
        const bibs = this.cytocore
          .elements(`edge[target = "${id}"]`)
          .sources()
          .map(
            (ele) =>
              new BibliographyItemLink(
                BibliographyItem.fromNode(ele),
                this.cyDb.loadContentOf(ele.id()),
                ele.id()
              )
          );

        return bibs;
      }
    }
  }

  findBibliographyById(id: string) {
    const bibliography = this.cytocore?.getElementById(id);
    if (bibliography) {
      return BibliographyItem.fromNode(bibliography);
    }
    return new BibliographyItem();
  }

  selectContent(id: string) {
    const targetObj = this.cytocore.getElementById(id);
    if (targetObj.isNode()) {
      if (targetObj.data().type == NODE_TYPES.DOCUMENT_NODE) {
        const { title, link, author, year, name } = targetObj.data();
        const bib = new BibliographyItem(title, link, name, author, year);
        this.appstate.contentSelected(id, name || '', {}, bib);
      } else {
        this.appstate.contentSelected(id, targetObj.data().name);
      }
    }
    if (targetObj.isEdge()) {
      const { name, source, target } = targetObj.data();
      this.appstate.contentSelected(id, name || '', { source, target });
    }
  }

  addChildToCurrentNode() {
    const currentId = this.appstate.documentState.contentId;
    const { x, y } = this.cytocore.getElementById(currentId).position();
    this.addNode({ parent: currentId, x, y });
    this.appstate.sidenavref.close();
  }
}
