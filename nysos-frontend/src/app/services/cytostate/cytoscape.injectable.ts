import { InjectionToken } from '@angular/core';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

export type Cytoscape = typeof cytoscape;

export const CYTOSCAPE = new InjectionToken<Cytoscape>('Browser Storage', {
  providedIn: 'root',
  factory: () => {
    try {
      // @ts-ignore
      cytoscape.use(edgehandles);
    } catch {}
    return cytoscape;
  },
});
