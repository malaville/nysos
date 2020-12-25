import { Inject, Injectable } from '@angular/core';
import {
  Core,
  EdgeCollection,
  EdgeSingular,
  EventObject,
  EventObjectNode,
  NodeCollection,
  NodeSingular,
  SingularElementArgument,
} from 'cytoscape';

import { defaults } from './edgehandlesdefault';
import { styles } from './cytostyles';
import { EDGE_TYPES, ElementSelectedEvent, NODE_TYPES } from './models';
import { edgehandlestyles } from './edgehandlesstyles';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';
import {
  BibliographyItem,
  BibliographyItemLink,
} from 'src/app/interface/source-manager/bibliography-item';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { apiIsReachable } from '../cytodatabase/fetchNysosBackend';
import { HSLColor } from 'src/app/interface/common/color-picker/color-picker.component';
import { ReplaySubject } from 'rxjs';
import { CYTOSCAPE, Cytoscape } from './cytoscape.injection.token';

const NEW_NAME = '';

@Injectable({
  providedIn: 'root',
})
export class CytostateService {
  cytocore: Core;
  edgehandles: any;
  hoverednode: boolean = false;
  addedgemode: boolean = false;
  saveDataOfNodeEvent = (event: EventObjectNode) => {
    const movedNode = event.target;
    this.cyDb.saveDataOrContentOf(movedNode.id(), movedNode.data());
  };

  private elementSelectedSubject = new ReplaySubject<
    ElementSelectedEvent | undefined
  >();
  readonly elementSelected$ = this.elementSelectedSubject.asObservable();

  private elementDataUpdatedSubject = new ReplaySubject<ElementSelectedEvent>();
  readonly elementDataUpdated$ = this.elementDataUpdatedSubject.asObservable();

  constructor(
    private cyDb: CytodatabaseService,
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
    this.cytocore = this.cytoscape({
      container: document.getElementById('cy'),
      style: [...styles, ...edgehandlestyles],
    });

    this.cytocore.on('data', this.handleDataEvent);

    this.cytocore.on('click touchend', 'node', (e) => {
      const id = e.target.id();
      this.selectElement(id);
    });

    this.cytocore.on('click touchend', 'edge', (e) => {
      const id = e.target.id();
      this.selectElement(id);
    });

    this.cytocore.on('move', 'node', this.saveDataOfNodeEvent);
    this.cytocore.on('move', 'node', this.handleColorationAfterMoveEvent);

    const complete = (x, y, addedEles) => {
      addedEles.forEach((ele) =>
        this.saveData(ele.data({ type: EDGE_TYPES.IDEA_LINK }).data())
      );
      this.edgeCreationMode();
    };
    // @ts-ignore
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
        this.selectElement(node.target.id())
    );

    this.cytocore.on('drag', 'node', ($nodeEvent) => {
      ($nodeEvent.target as NodeSingular)
        .descendants()
        .union($nodeEvent.target as NodeSingular)
        .filter((node: NodeSingular) => node.descendants().length == 0)
        .forEach((node) =>
          this.saveData({ ...node.data(), position: node.position() })
        );
    });
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
        position:
          params.parent && params.x && params.y
            ? { x: params.x + 10, y: params.y + 20 }
            : center,
      })
      .select();

    this.saveData({ ...newNode.data(), position: newNode.position() });
    this.selectElement(newNode.id());
    return newNode;
  }

  changeElementName(id: string, newName: string) {
    const element = this.findElementByIdOrThrow(id).data({ name: newName });
    this.updatedElementData(element);
  }

  findNodeByIdOrThrow(id: string): NodeSingular {
    const element = this.findElementByIdOrThrow(id);
    if (element.isNode()) {
      return element as NodeSingular;
    }
    console.error(`The element you queried was not a node`, element);
    throw 'Element you queried was not a node';
  }

  findEdgeByIdOrThrow(id: string): EdgeSingular {
    const element = this.findElementByIdOrThrow(id);
    if (element.isEdge()) {
      return element as EdgeSingular;
    }
    console.error(`The element you queried was not an edge`, element);
    throw 'Element you queried was not an edge';
  }

  existsById(id: string): boolean {
    return this.cytocore.getElementById(id).length > 0;
  }

  findElementByIdOrThrow(id: string): EdgeSingular | NodeSingular {
    const elements = this.cytocore.getElementById(id);
    if (elements.length !== 1) {
      console.error(
        `The id you queried returned ${elements.length} elements, but should be one`,
        elements
      );
    }

    return elements.first();
  }

  addBibliography(contentId: string, biblioItem: BibliographyItem) {
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

    this.elementDataUpdatedSubject.next({
      id: documentData.first().id(),
      data: documentData.first().data,
      type: documentData.data().type,
    });
  }

  addBibliographyLink(documentId: string, nodeOrEdgeId: string) {
    const documentAcronym = this.findNodeByIdOrThrow(documentId).data().name;
    const element = this.findElementByIdOrThrow(nodeOrEdgeId);
    const objectName = element.data().name;

    let edge_type = EDGE_TYPES.DOCUMENT_ON_RELATION;
    if (element.isNode()) {
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
    const targetNode = this.findElementByIdOrThrow(id);
    targetNode.data(nodeData);
    const nodeModified = this.findElementByIdOrThrow(id);

    this.updatedElementData(nodeModified);
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
    const bibliography = this.findNodeByIdOrThrow(id);
    if (bibliography) {
      return BibliographyItem.fromNode(bibliography);
    }
    return new BibliographyItem();
  }

  selectElement(id: string) {
    const targetObj = this.findElementByIdOrThrow(id);
    this.elementSelectedSubject.next({
      id: targetObj.id(),
      data: targetObj.data(),
      type: targetObj.data().type,
    });
  }

  updatedElementData(element: NodeSingular | EdgeSingular) {
    this.elementDataUpdatedSubject.next({
      id: element.id(),
      data: element.data(),
      type: element.data().type,
    });
  }

  addChildToCurrentNode(currentId: string): boolean {
    const { x, y } = this.findNodeByIdOrThrow(currentId).position();
    const node = this.addNode({ parent: currentId, x, y });
    this.handleColorationAfterMove(node);
    return true;
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
    this.findNodeByIdOrThrow(ancestorId)
      .children()
      .forEach((childElement) => {
        childElement.move({ parent: null });
      });
  }

  private deleteElement(elementId: string) {
    this.eraseAllParentingRelationsWithAncestor(elementId);
    this.cytocore.remove(this.findElementByIdOrThrow(elementId));
    this.saveDeletionLocallyAndRemote(elementId);
  }

  private hasADocumentAsASourceThatWillBecomeOrphan(
    elementId: string
  ): string | null {
    const element = this.findElementByIdOrThrow(elementId);
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

      if (this.existsById(elementId)) {
        this.updatedElementData(this.findElementByIdOrThrow(elementId));
      } else {
        this.elementSelectedSubject.next(undefined);
      }
    } else {
      this._snackBar.open(
        `Sorry but ${elementsRelying} links are relying on this element. Open console (F12) to see their names. You must delete them before`,
        'Okay',
        { duration: 3000 }
      );
    }
  }

  deleteFocusedElement(elementId: string) {
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
          if (this.existsById(parentId)) {
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
          if (this.existsById(parentId)) {
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

  setColor(nodeId: string, color: HSLColor | number) {
    if (color === undefined) {
      color = [undefined, 0, 0];
    }
    if (typeof color == 'number') {
      color = [color, 0, 0];
    }
    const targetNode = this.findNodeByIdOrThrow(nodeId);
    let ancestor: NodeCollection = targetNode;
    if (targetNode.parents().length > 0) {
      ancestor = targetNode.ancestors().last().union([]);
    }
    this.setHueToDescendants(ancestor, color[0]);
    this.updatedElementData(targetNode);
    this.saveData(ancestor.last().data());
  }

  setHueToDescendants(
    ancestor: NodeCollection,
    hue: number | undefined,
    cleanHue = true
  ) {
    if (hue === undefined || hue === null) {
      ancestor
        .descendants()
        .union(ancestor)
        .removeStyle('background-color')
        .removeData('inheritedHue hue');

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

  zoomAndCenterOn(id: string) {
    const constellation = this.findElementByIdOrThrow(id);

    this.cytocore.fit(constellation, 300);
    this.cytocore.panBy({
      x: 200,
      y: 0,
    });
  }
}
