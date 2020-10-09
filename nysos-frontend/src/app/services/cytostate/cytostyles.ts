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
];
