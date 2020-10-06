import { Injectable } from '@angular/core';
import { CollectionReturnValue, Core } from 'cytoscape';
const CYTOSAVE_KEY = 'cytosave';

@Injectable({
  providedIn: 'root',
})
export class CytodatabaseService {
  constructor() {}

  saveNodesAndEdges(elements: CollectionReturnValue) {
    localStorage.setItem(CYTOSAVE_KEY, JSON.stringify(elements.jsons()));
  }

  loadFromLocalStorage(cytocore: Core): boolean {
    const cytosave = localStorage.getItem(CYTOSAVE_KEY);
    if (cytosave) {
      cytocore.elements().remove();
      cytocore.add(JSON.parse(cytosave));
      return true;
    }
    return false;
  }

  saveContentOf(id: string, content: string) {
    localStorage.setItem(`${id}:content`, content);
  }
  loadContentOf(id: string) {
    return localStorage.getItem(`${id}:content`) || '';
  }
}
