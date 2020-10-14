export const DOCUMENT_EDGE = 'DOCUMENT_EDGE';

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
    selector: '.' + DOCUMENT_EDGE,
    style: {
      opacity: 0,
    },
  },
];
