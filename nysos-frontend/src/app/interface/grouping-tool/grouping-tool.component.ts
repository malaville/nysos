import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import cytoscape, { EdgeCollection, NodeCollection } from 'cytoscape';
import { Core } from 'cytoscape';
import { styles } from 'src/app/services/cytostate/cytostyles';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

type NodeDataType = {
  data: { name: string; id: string };
};
type EdgeDataType = { data: { source: string; target: string } };

const style = [
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
      transform: (node, pos) => ({ x: pos.x, y: -pos.y }),
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
    }).on('move', (ele) => {
      console.log(
        'Data was accessed on ',
        ele.target.data().name,
        ele.target.data()
      );
    });

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
      if (children.length > 0) {
        const addedContainer = core.add({
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
