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
    },
  },
];
