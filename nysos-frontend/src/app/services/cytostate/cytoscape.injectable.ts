import { InjectionToken } from '@angular/core';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

export type Cytoscape = typeof cytoscape;

export const CYTOSCAPE = new InjectionToken<Cytoscape>('Browser Storage', {
  providedIn: 'root',
  factory: () => {
    console.log('Cytoscape gets created');
    // @ts-ignore
    cytoscape.use(edgehandles);
    return cytoscape;
  },
});
