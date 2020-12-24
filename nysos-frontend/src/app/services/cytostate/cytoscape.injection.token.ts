import { InjectionToken } from '@angular/core';
import cytoscape, { Ext } from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

export type Cytoscape = typeof cytoscape;

export const CYTOSCAPE = new InjectionToken<Cytoscape>('Browser Storage', {
  providedIn: 'root',
  factory: () => {
    try {
      cytoscape.use((edgehandles as unknown) as Ext);
    } catch (e) {}
    return cytoscape;
  },
});
