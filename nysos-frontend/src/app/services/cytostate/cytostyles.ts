import { EDGE_TYPES, NODE_TYPES } from './models';

export const styles = [
  {
    selector: 'node[name]',
    style: {
      content: 'data(name)',
    },
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      content: 'data(name)',
      'text-outline-color': 'white',
      'text-outline-width': 1,
    },
  },
  {
    selector: '.' + EDGE_TYPES.DOCUMENT_ON_THEME,
    style: {
      opacity: 0,
    },
  },
  {
    selector: '.' + EDGE_TYPES.DOCUMENT_ON_RELATION,
    style: {
      opacity: 0,
    },
  },
  {
    selector: '.' + NODE_TYPES.DOCUMENT_NODE,
    style: {
      opacity: 0,
    },
  },
];
