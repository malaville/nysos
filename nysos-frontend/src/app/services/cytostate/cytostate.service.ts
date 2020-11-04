import { Injectable } from '@angular/core';
import {
  CollectionReturnValue,
  Core,
  EdgeHandlesApi,
  Ext,
  NodeSingular,
} from 'cytoscape';
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
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { apiIsReachable } from '../cytodatabase/fetchNysosBackend';

const NEW_NAME = '';

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
    private appstate: AppstateService,
    private authState: SocialAuthService,
    private _snackBar: MatSnackBar
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

    this.cytocore.on('click touchend', 'node', (e) => {
      const id = e.target.id();
      this.selectContent(id);
    });

    this.cytocore.on('click touchend', 'edge', (e) => {
      const id = e.target.id();
      this.selectContent(id);
    });

    const complete = (x, y, addedEles) => {
      addedEles.forEach((ele) =>
        this.saveData(ele.data({ type: EDGE_TYPES.IDEA_LINK }).data())
      );
      this.edgeCreationMode();
    };
    this.edgehandles = this.cytocore.edgehandles({ ...defaults, complete });
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
      (node) =>
        node.target.data().name == NEW_NAME &&
        this.selectContent(node.target.id())
    );
    const timeoutId = setTimeout(
      () => this.cyDb.loadFromLocalStorage(this.cytocore),
      1000
    );
    this.authState.authState.pipe(take(1)).subscribe((socialUser) => {
      clearTimeout(timeoutId);
      this.startUpProcessWhenAuthenticated(this.cytocore, socialUser);
    });
  }

  async isAuthStateResolved(): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 10);
      this.authState.authState.toPromise().then(() => {
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }

  async restartStartUp() {
    let resolved = await this.isAuthStateResolved();
    if (!resolved) {
      const online = await apiIsReachable();
      if (online) {
        try {
          resolved = await !!this.authState.signIn(
            GoogleLoginProvider.PROVIDER_ID
          );
        } catch (err) {
          this._snackBar.open('Login failed ...', 'Ok', { duration: 1000 });
          return;
        }
      } else {
        this._snackBar.open("You're not online, retry later ...", 'Ok', {
          duration: 1000,
        });
      }
    }

    resolved && this.startUpProcessWhenAuthenticated(this.cytocore, true);
    return;
  }

  async startUpProcessWhenAuthenticated(cytocore: Core, socialUser) {
    const changesAreWaiting = this.cyDb.changesAreWaiting();
    if (socialUser) {
      // isLogged in
      const authToken = socialUser.authToken;
      this.cyDb.setOnline();
      if (changesAreWaiting) {
        const saved = await this.cyDb
          .trySaveLocalContentChanges()
          .catch((err) => {
            console.log('TrySaveAll failed', err);
          });
      }
      try {
        await this.cyDb.loadFromRemote(cytocore);
        this.cyDb.saveNodesAndEdgesLocally(cytocore.elements());
      } catch (err) {
        this.cyDb.loadFromLocalStorage(this.cytocore);
        if (err.empty) {
          this.cyDb.saveAllToRemote(this.cytocore);
        }
      }
    } else {
      this.cyDb.loadFromLocalStorage(this.cytocore);
    }
  }

  edgeCreationMode() {
    this.addedgemode = !this.addedgemode;
    this.addedgemode ? this.edgehandles.enable() : this.edgehandles.disable();
  }

  saveData(data?: any) {
    data && this.cyDb.saveDataOrContentOf(data.id, data);
    this.cyDb.saveNodesAndEdgesLocally(this.cytocore.elements());
  }

  saveDeletionLocallyAndRemote(elementId: string) {
    this.cyDb.deleteDataAndContentOf(elementId);
    this.cyDb.saveNodesAndEdgesLocally(this.cytocore.elements());
  }

  loadFromLocalStorage() {
    this.cyDb.loadFromLocalStorage(this.cytocore);
    this.cytocore.reset();
  }

  addNode(params: { parent?: string; x?: number; y?: number } = {}) {
    const newNode = this.cytocore.add({
      group: 'nodes',
      data: {
        name: NEW_NAME,
        parent: params.parent,
        type: NODE_TYPES.THEME_NODE,
      },
      position: params.parent
        ? { x: params.x + 10, y: params.y + 20 }
        : { x: 50, y: 50 },
    });
    this.saveData({ ...newNode.data(), position: newNode.position() });
  }

  changeNodeName(newName: string) {
    const id = this.appstate.documentState.contentId;
    const valid =
      this.cytocore.getElementById(id).data({ name: newName }).data().name ==
      newName;
    !valid &&
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
      // BibliographyOfElement(X : Theme or Theme_link)
      // Take all Edges -> X, that are a DOCUMENT_LINK
      // For all those edges, the description is contained by the edge itself
      // And the father document is in the source of the edge.
      return this.cytocore
        .edges(
          `[target = "${id}"][type = "${EDGE_TYPES.DOCUMENT_ON_RELATION}"], [target = "${id}"][type = "${EDGE_TYPES.DOCUMENT_ON_THEME}"]`
        )
        .map((documentLinkTargetingX) => {
          const sourceDocument = documentLinkTargetingX.source();
          const linkId = documentLinkTargetingX.id();
          return new BibliographyItemLink(
            BibliographyItem.fromNode(sourceDocument),
            this.cyDb.loadContentOf(linkId),
            linkId,
            this.cyDb.loadRemoteContentOf(linkId)
          );
        });
    } else {
      return [];
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

  private getEdgesRelyingOn(elementId: string) {
    return this.cytocore
      .edges()
      .filter(
        (edge) =>
          edge.target().id() == elementId || edge.source().id() == elementId
      );
  }

  private eraseAllParentingRelationsWithAncestor(ancestorId: string) {
    this.cytocore
      .getElementById(ancestorId)
      .children()
      .forEach((childElement) => {
        childElement.move({ parent: null });
      });
  }

  deleteFocusedElement() {
    const elementId = this.appstate.documentState.contentId;
    const elementsRelying = this.getEdgesRelyingOn(elementId).length;
    if (elementsRelying === 0) {
      this.eraseAllParentingRelationsWithAncestor(elementId);
      this.cytocore.remove(this.cytocore.getElementById(elementId));
      this.saveDeletionLocallyAndRemote(elementId);
      this.appstate.unselectContent();
    } else {
      this._snackBar.open(
        `Sorry but ${elementsRelying} links are relying on this element. Open console (F12) to see their names. You must delete them before`,
        'Okay',
        { duration: 3000 }
      );
    }
  }
}
