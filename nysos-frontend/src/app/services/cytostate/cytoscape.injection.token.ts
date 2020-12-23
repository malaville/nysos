import { InjectionToken } from '@angular/core';
import cytoscape from 'cytoscape';
const edgehandles = require('cytoscape-edgehandles');

export type Cytoscape = typeof cytoscape;

export const CYTOSCAPE = new InjectionToken<Cytoscape>('Browser Storage', {
  providedIn: 'root',
  factory: () => {
    console.log('Cytoscape gets created');
    try {
      cytoscape.use(edgehandles);
    } catch (e) {
      console.log('failed', e);
    }
    return cytoscape;
  },
});
