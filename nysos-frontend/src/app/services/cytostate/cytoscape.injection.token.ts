import { InjectionToken } from '@angular/core';
import cytoscape from 'cytoscape';

export type Cytoscape = typeof cytoscape;

export const CYTOSCAPE = new InjectionToken<Cytoscape>('Browser Storage', {
  providedIn: 'root',
  factory: () => {
    console.log('Cytoscape gets created');
    try {
      // @ts-ignore
      cytoscape.use(edgehandles);
    } catch (e) {}
    return cytoscape;
  },
});
