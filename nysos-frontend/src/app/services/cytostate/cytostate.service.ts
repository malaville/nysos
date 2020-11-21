import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
  Core,
  EdgeCollection,
  EdgeHandlesApi,
  EventObject,
  EventObjectNode,
  NodeCollection,
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
import { Color } from 'src/app/interface/common/color-picker/color-picker.component';

const NEW_NAME = '';

type Cytoscape = typeof cytoscape;

export const CYTOSCAPE = new InjectionToken<Cytoscape>('Browser Storage', {
  providedIn: 'root',
  factory: () => {
    console.log('Cytoscape gets created');
    try {
      // @ts-ignore
      cytoscape.use(edgehandles);
    } catch (e) {}
    return cytoscape;
  },
});
@Injectable({
  providedIn: 'root',
})
export class CytostateService {
  cytocore: Core;
  edgehandles: EdgeHandlesApi;
  hoverednode: boolean = false;
  addedgemode: boolean = false;
  saveDataOfNodeEvent = (event: EventObjectNode) => {
    const movedNode = event.target;
    this.cyDb.saveDataOrContentOf(movedNode.id(), movedNode.data());
  };

  constructor(
    private cyDb: CytodatabaseService,
    private appstate: AppstateService,
    private authState: SocialAuthService,
    private _snackBar: MatSnackBar,
    @Inject(CYTOSCAPE) private cytoscape: Cytoscape
  ) {}

  handleDataEvent = (e: EventObject) => {
    this.saveData({
      ...e.target.data(),
      position: (e.target.isNode() && e.target.position()) || undefined,
    });
  };

  setCytocoreId(id: string) {
    // @ts-ignore

    this.cytocore = this.cytoscape({
      container: document.getElementById('cy'),
      style: [...styles, ...edgehandlestyles],
    });

    this.cytocore.on('data', this.handleDataEvent);

    this.cytocore.on('click touchend', 'node', (e) => {
      const id = e.target.id();
      this.selectContent(id);
    });

    this.cytocore.on('click touchend', 'edge', (e) => {
      const id = e.target.id();
      this.selectContent(id);
    });

    this.cytocore.on('move', 'node', this.saveDataOfNodeEvent);
    this.cytocore.on('move', 'node', this.handleColorationAfterMoveEvent);

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
      () => this.loadWithSave(this.cyDb.loadFromLocalStorage().data),
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
        const { data } = await this.cyDb.loadFromRemote();
        this.loadWithSave(data);
        this.cyDb.saveNodesAndEdgesLocally(cytocore.elements());
      } catch (err) {
        this.loadWithSave(this.cyDb.loadFromLocalStorage().data);
        if (err.empty) {
          this.cyDb.saveAllToRemote(this.cytocore);
        }
      }
    } else {
      this.loadWithSave(this.cyDb.loadFromLocalStorage().data);
    }
  }

  loadWithSave(cytosave: any) {
    if (cytosave) {
      this.cytocore.elements().remove();
      this.cytocore.add(cytosave);
      this.computeColors(this.cytocore);
      this.cytocore.fit(undefined, 200);
      return true;
    }
    return false;
  }

  computeColors(core: Core) {
    core
      .elements('node[hue]')
      .forEach((nodeWithHue) =>
        this.setHueToDescendants(nodeWithHue, nodeWithHue.data().hue)
      );
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
    this.loadWithSave(this.cyDb.loadFromLocalStorage().data);
    this.cytocore.reset();
  }

  addNode(params: { parent?: string; x?: number; y?: number } = {}) {
    const bb = this.cytocore.nodes().boundingBox({});
    const center = { x: (bb.x1 + bb.x2) / 2, y: (bb.y1 + bb.y2) / 2 };
    this.cytocore.elements().unselect();
    const newNode = this.cytocore
      .add({
        group: 'nodes',
        data: {
          name: NEW_NAME,
          parent: params.parent,
          type: NODE_TYPES.THEME_NODE,
        },
        position: params.parent
          ? { x: params.x + 10, y: params.y + 20 }
          : center,
      })
      .select();

    this.saveData({ ...newNode.data(), position: newNode.position() });
    this.selectContent(newNode.id());
    return newNode;
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
        author: biblioItem.authors[0],
        date: biblioItem.date,
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
    const node = this.addNode({ parent: currentId, x, y });
    this.handleColorationAfterMove(node);
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

  private deleteElement(elementId: string) {
    this.eraseAllParentingRelationsWithAncestor(elementId);
    this.cytocore.remove(this.cytocore.getElementById(elementId));
    this.saveDeletionLocallyAndRemote(elementId);
  }

  private hasADocumentAsASourceThatWillBecomeOrphan(
    elementId: string
  ): string | null {
    const element = this.cytocore.getElementById(elementId);
    if (
      !element.isEdge() ||
      element.source().data().type !== NODE_TYPES.DOCUMENT_NODE ||
      element.source().degree(false) > 1
    )
      return null;
    else return element.source().id();
  }

  handleDeleteElement(elementId: string) {
    const elementsRelying = this.getEdgesRelyingOn(elementId).length;
    if (elementsRelying === 0) {
      const futureOrphanDocumentSourceDetected = this.hasADocumentAsASourceThatWillBecomeOrphan(
        elementId
      );
      if (futureOrphanDocumentSourceDetected) {
        this.deleteElement(elementId);
      }
      this.deleteElement(elementId);

      if (
        this.cytocore.getElementById(this.appstate.documentState.contentId)
          .length
      ) {
        this.appstate.refreshDocummentState();
      } else {
        this.appstate.unselectContent();
      }
    } else {
      this._snackBar.open(
        `Sorry but ${elementsRelying} links are relying on this element. Open console (F12) to see their names. You must delete them before`,
        'Okay',
        { duration: 3000 }
      );
    }
  }

  deleteFocusedElement() {
    const elementId = this.appstate.documentState.contentId;
    this.handleDeleteElement(elementId);
  }

  getThemeNodes() {
    return this.cytocore
      .nodes()
      .filter((node) => node.data().type == NODE_TYPES.THEME_NODE);
  }

  importNewParentingRelations(newRelations: EdgeCollection) {
    this.cytocore.nodes().forEach((node) => {
      if (node.parent().length > 0) {
        // check if the parent is still its parent
        const foundNode = newRelations.filter(
          (edge) => edge.source().id() == node.id()
        );
        if (foundNode.length == 0) {
          // we didn't find the node in the list, it became an orphan, sorry bro
          node.move({ parent: null });
        }
        // We found you, but you may have a new parent
        else if (foundNode.target().id() !== node.parent()[0].id()) {
          // Sorry you were adopted by a new dude, Brandon. Call him daddy.
          const parentId = foundNode.target().id();
          if (this.cytocore.getElementById(parentId).length == 0) {
            const addedNode = this.cytocore.add(foundNode.target());
            this.cyDb.saveDataOrContentOf(addedNode.id(), addedNode.data());
          }
          node.move({ parent: parentId });
        }
        // Lucky You, nothing happened
      } else if (node.parent().length == 0) {
        // Maybe you were adopted lately
        const foundNode = newRelations.filter(
          (edge) => edge.source().id() == node.id()
        );
        if (foundNode.length > 0) {
          // SYou have a new DADDYYYY
          const parentId = foundNode.target().id();
          if (this.cytocore.getElementById(parentId).length == 0) {
            const addedNode = this.cytocore.add(foundNode.target());
            this.cyDb.saveDataOrContentOf(addedNode.id(), addedNode.data());
          }
          node.move({ parent: parentId });
        }
      }
    });
  }

  groupSeletedNodesAtAncestorLevels() {
    const newNode = this.cytocore.add({
      group: 'nodes',
      classes: NODE_TYPES.THEME_NODE,
      data: {
        name: 'New Container',
        type: NODE_TYPES.THEME_NODE,
      },
    });
    this.cytocore
      .nodes(':selected')
      .orphans()
      .move({ parent: newNode.id() })
      .union(newNode)
      .forEach((node) => this.saveData(node.data()));
  }

  deleteSelectedThemes() {
    const deletedNodesAndConnectedEdges = this.cytocore
      .nodes(':selected')
      .union(this.cytocore.nodes(':selected').neighborhood().edges());

    const confirmation = confirm(
      `Are you sure you want to delete those ${deletedNodesAndConnectedEdges.length} elements ?`
    );
    if (confirmation) {
      deletedNodesAndConnectedEdges.remove();
      deletedNodesAndConnectedEdges.forEach((ele) =>
        this.saveDeletionLocallyAndRemote(ele.id())
      );
    }
  }

  setColor(nodeId: string, color: Color | number) {
    if (color === undefined) {
      color = [undefined, 0, 0];
    }
    if (typeof color == 'number') {
      color = [color, 0, 0];
    }
    const targetNode = this.cytocore.getElementById(nodeId).nodes();
    let ancestor: NodeCollection = targetNode;
    if (targetNode.parents().length > 0) {
      ancestor = targetNode.ancestors().last().union([]);
    }
    this.setHueToDescendants(ancestor, color[0]);

    ancestor.last().data({ hue: color[0] });
    this.saveData(ancestor.last().data());
  }

  setHueToDescendants(ancestor: NodeCollection, hue: number, cleanHue = true) {
    if (hue === undefined) {
      ancestor
        .descendants()
        .union(ancestor)
        .removeStyle('background-color')
        .forEach((node) => {
          if (node.data().hue) {
            node.removeData('hue');
          }
        });
      return;
    }
    let maxdepth = 0;
    let currentNode = ancestor.nodes();
    while (currentNode.length > 0) {
      maxdepth++;
      currentNode = currentNode.children();
    }
    let currentDepth = 0;
    currentNode = ancestor.nodes();
    while (currentNode.length > 0) {
      currentDepth++;
      const c = this.colorShade(hue, currentDepth, maxdepth);
      const backgroundColor = `hsl(${c[0]}, ${Math.floor(c[1])}% ,${c[2]}%)`;
      currentNode.style({
        backgroundColor,
      });
      this.cytocore.removeListener('data');
      currentNode.forEach((node) => {
        node.data({ inheritedHue: c[0] });
      });
      this.cytocore.on('data', this.handleDataEvent);
      currentNode = currentNode.children();
    }
    if (cleanHue) {
      ancestor.descendants().forEach((node) => {
        if (node.data().hue) {
          node.removeData('hue');
          this.saveData(node.data());
        }
      });
    }
  }

  handleColorationAfterMoveEvent = (event: EventObjectNode) =>
    this.handleColorationAfterMove(event.target);

  handleColorationAfterMove = (nodeBeingMoved: NodeCollection) => {
    const ancestor = nodeBeingMoved.ancestors().last();
    if (ancestor.length > 0) {
      // The node was moved in
      // It should take color of new ancestor (be it something or null)
      const ancestorHue = ancestor.data().hue;
      if (ancestorHue) {
        this.setHueToDescendants(ancestor, ancestorHue);
      } else {
        this.setHueToDescendants(ancestor, undefined);
      }
      return;
    }
    // The node was moved OUT
    this.setHueToDescendants(nodeBeingMoved, undefined);
  };

  colorShade(h, depth, maxdepth): [number, number, number] {
    const factor = depth / maxdepth;
    const factorReaching0 = (depth - 1) / maxdepth;
    return [h, 60 * factorReaching0 + 20, 80 * (1 - factorReaching0)];
  }
}
