import { Injectable, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { CollectionReturnValue, Core } from 'cytoscape';
const CYTOSAVE_KEY = 'cytosave';

@Injectable({
  providedIn: 'root',
})
export class CytodatabaseService {
  authToken: string;
  constructor(private authService: SocialAuthService) {
    this.authService.authState.subscribe(
      (st) => (this.authToken = st.authToken)
    );
  }

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

  async saveContentOf(contentId: string, content: string): Promise<boolean> {
    localStorage.setItem(`${contentId}:content`, content);
    console.log('this.token', this.authToken);
    const responseJson = await fetch(
      `http://localhost:3000/savecontent?token=${this.authToken}`,
      {
        method: 'POST',
        mode: 'cors',
        cache: 'default',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, content }),
      }
    ).then((res: Response) => res.json());
    return responseJson.success;
  }

  loadContentOf(id: string) {
    return localStorage.getItem(`${id}:content`) || '';
  }
}
