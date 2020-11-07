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
  public removeMode: boolean;
  private static edgeHandles: EdgeHandlesApi;
  constructor() {}

  ngOnInit(): void {
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
    this.cytoHierarchy.on('select', 'edges', (el) => {
      this.removeMode = true;
    });
    this.cytoHierarchy.on('unselect', 'edges', (el) => {
      this.cytoHierarchy.elements(':selected').length == 0 &&
        (this.removeMode = false);
    });
    // @ts-ignore
    const cdnd = this.cytoHierarchy.compoundDragAndDrop();
    cdnd.enable();
    // @ts-ignore
    GroupingToolComponent.edgeHandles = this.cytoHierarchy.edgehandles({
      show: (node) => {
        (node.children().length > 0 || node.outgoers().length > 0) &&
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
      if (ele.target.isEdge()) return;
      if (ele.target.parent().length > 0) {
        // ele was moved in a group

        if (ele.target.parent().classes().includes('CONTAINER')) {
          // Was moved in an EXISTING group

          const parentId = ele.target.parent().id().split(':')[0];
          const nodeId = ele.target.id();

          this.cytoHierarchy.add({
            group: 'edges',
            data: { source: nodeId, target: parentId },
          });
        } else {
          // Was moved in a newly created group
          if (ele.target.outgoers().length > 0) {
            return;
          }
          const brothers = ele.target.parent().children();
          const parent = brothers.outgoers()?.nodes()[0];
          if (parent) {
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
    this.cytoHierarchy.nodes().unselectify();
    this.cytoHierarchy.fit();
  }

  ngOnDestroy(): void {
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

  onRemoveEdgeClicked() {
    const edgesToRemove = this.cytoHierarchy.edges(':selected');
    edgesToRemove.sources().move({ parent: null });
    edgesToRemove.remove();
    this.removeMode = false;
  }
}
