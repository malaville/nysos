import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import cytoscape, { EdgeHandlesApi, NodeCollection } from 'cytoscape';
import { Core } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import { edgehandlestyles } from 'src/app/services/cytostate/edgehandlesstyles';

cytoscape.use(compoundDragAndDrop);
cytoscape.use(dagre);

type NodeDataType = {
  data: { name: string; id: string };
};
type EdgeDataType = { data: { source: string; target: string } };

const style = [
  ...edgehandlestyles,
  {
    selector: 'node[name]',
    style: {
      content: 'data(name)',
      'font-size': 10,
      'text-rotation': -0.2,
    },
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
    },
  },
];

interface GroupingToolComponentConfigInterface {
  closeFunction();
  nodes: NodeCollection;
}
@Component({
  selector: 'app-grouping-tool',
  templateUrl: './grouping-tool.component.html',
  styleUrls: ['./grouping-tool.component.css'],
})
export class GroupingToolComponent implements OnInit, OnDestroy {
  @Input() config: GroupingToolComponentConfigInterface;
  private cytoHierarchy: Core;
  private static edgeHandles: EdgeHandlesApi;
  constructor() {}

  ngOnInit(): void {
    console.log('OnInit');
    const edges = GroupingToolComponent.generateParentEdges(this.config.nodes);
    const nodesWithParentsOrChildren = GroupingToolComponent.cleanNodes(
      this.config.nodes.filter(
        (node) => node.parent().length > 0 || node.children().length > 0
      )
    );
    const nodesAlone = this.config.nodes.filter(
      (node) => node.parent().length == 0 && node.children().length == 0
    );

    let layout = {
      name: 'dagre',
      transform: (node, pos) => ({ x: pos.x * 1.2, y: -pos.y * 1.4 }),
      padding: 20,
    };
    this.cytoHierarchy = cytoscape({
      container: document.getElementById('hierarchicalCytoscape'),
      elements: {
        nodes: nodesWithParentsOrChildren,
        edges,
      },
      layout,
      style,
    });

    // @ts-ignore
    const cdnd = this.cytoHierarchy.compoundDragAndDrop({
      grabbedNode: (node) =>
        console.log('grabbedNode', node.data().name) + '' || true, // filter function to specify which nodes are valid to grab and drop into other nodes
      dropTarget: (node) =>
        console.log('dropTarget', node.data().name) + '' || true, // filter function to specify which parent nodes are valid drop targets
      dropSibling: (node) =>
        console.log('dropSibling', node.data().name) + '' || true, // filter function to specify which orphan nodes are valid drop siblings
      newParentNode: (grabbedNode, dropSibling) => ({}), // specifies element json for parent nodes added by dropping an orphan node on another orphan (a drop sibling)
      overThreshold: 10, // make dragging over a drop target easier by expanding the hit area by this amount on all sides
      outThreshold: 10, // make dra
    });
    cdnd.enable();
    // @ts-ignore
    GroupingToolComponent.edgeHandles = this.cytoHierarchy.edgehandles({
      show: (node) => {
        console.log(node.classes());
        node.hasClass('CONTAINER') &&
          this.cytoHierarchy.elements('.eh-handle').remove();
      },
    });
    GroupingToolComponent.edgeHandles.enable();

    const addedNodesWithHierarchicalStructure = this.cytoHierarchy.nodes();

    const { x1, x2, y1, y2, w, h } = this.cytoHierarchy.nodes().boundingBox({});

    const addedNodesAlone = this.cytoHierarchy.add(nodesAlone);
    addedNodesAlone
      .layout({
        name: 'grid',
        boundingBox: {
          y1: y2 + 0.2 * h,
          x1,
          h: h / 2,
          w,
        },
      })
      .run();

    GroupingToolComponent.associateBrothersInCoumpoundNodes(
      addedNodesWithHierarchicalStructure,
      this.cytoHierarchy
    );

    this.cytoHierarchy.on('move', (ele, ele2) => {
      console.log('Ele was moved', ele.target.data().name);
      if (ele.target.isEdge()) return;
      if (ele.target.parent().length > 0) {
        // ele was moved in a group
        console.log('Ele was added to a group');
        console.log(ele.target.parent().classes());
        if (ele.target.parent().classes().includes('CONTAINER')) {
          // Was moved in an EXISTING group
          console.log('Ele was added to an existing group');
          const parentId = ele.target.parent().id().split(':')[0];
          const nodeId = ele.target.id();
          console.log('Creation of the edge ', {
            source: nodeId,
            target: parentId,
          });
          this.cytoHierarchy.add({
            group: 'edges',
            data: { source: nodeId, target: parentId },
          });
        } else {
          // Was moved in a newly created group
          console.log('Ele was added to a new container');
          if (ele.target.outgoers().length > 0) {
            return;
          }
          const brothers = ele.target.parent().children();
          const parent = brothers.outgoers()?.nodes()[0];
          if (parent) {
            console.log('parent', parent);
            this.cytoHierarchy.add({
              group: 'edges',
              data: { source: ele.target.id(), target: parent.id() },
            });
          }
        }
      } else {
        // ele was moved "out" of a container
        ele.target.outgoers()?.edges()[0]?.remove();
      }
    });
    this.cytoHierarchy.fit();
  }

  ngOnDestroy(): void {
    console.log('OnDestroy');
    this.cytoHierarchy.destroy();
  }

  onCloseClicked(): void {
    this.config.closeFunction();
  }

  private static generateParentEdges(nodes: NodeCollection): EdgeDataType[] {
    nodes.map((node) => node.data().parent);
    return nodes
      .filter((node) => node.data().parent)
      .map((node) => ({
        data: { source: node.id(), target: node.data().parent },
      }));
  }

  private static cleanNodes(nodes: NodeCollection): NodeDataType[] {
    return nodes.map((node) => ({
      data: { id: node.id(), name: node.data().name },
    }));
  }

  private static associateBrothersInCoumpoundNodes(
    nodes: NodeCollection,
    core: Core
  ) {
    const roots = nodes.leaves().toArray();

    for (let nodeIndex = 0; nodeIndex < roots.length; nodeIndex++) {
      const root = roots[nodeIndex];
      const children = root.incomers().nodes();
      console.log(
        'root',
        root.data().name,
        children.map((node) => node.data().name)
      );
      if (children.length > 1) {
        const addedContainer = core.add({
          classes: 'CONTAINER',
          data: {
            name: `${root.data().name}:group`,
            id: `${root.id()}:children`,
          },
        });
        children.forEach((child) => {
          child.move({ parent: addedContainer.id() });
        });
        roots.push(...children.toArray());
      }
    }
  }
}
