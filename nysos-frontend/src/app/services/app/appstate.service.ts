import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';
import { BibliographyItem } from 'src/app/interface/source-manager/bibliography-item';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';
import { CytostateService } from '../cytostate/cytostate.service';

export interface DocumentDataStateInterface {
  title: string;
  contentId: string;
  content: string;
  edgeTargetId?: string;
  edgeSourceId?: string;
  bibliographyId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppstateService {
  sidenavref: MatSidenav;

  readonly documentState: DocumentDataStateInterface = {
    title: undefined,
    contentId: undefined,
    content: LOREM_IPSUMS,
    bibliographyId: undefined,
  };
  private documentStateBS = new BehaviorSubject(this.documentState);
  readonly documentStateObservable = this.documentStateBS.asObservable();

  constructor(private cytoDb: CytodatabaseService) {}

  setSidenavRef(sidenavref: MatSidenav) {
    this.sidenavref = sidenavref;
    setTimeout(
      () =>
        this.contentSelected(
          '5f9f73e4-8864-4ac3-9d5e-27c8bec69c9c',
          'Titre de dingue on est vraiment contents'
        ),
      20
    );
  }

  contentSelected(id: string, name: string, edgeInfos: any = {}) {
    this.documentState.title = name;
    this.documentState.contentId = id;
    this.documentState.content = this.cytoDb.loadContentOf(id);
    const { source, target } = edgeInfos;
    this.documentState.edgeSourceId = source || undefined;
    this.documentState.edgeTargetId = target || undefined;
    this.documentStateBS.next(this.documentState);
    this.sidenavref.open();
  }

  saveContent(content: string) {
    this.cytoDb.saveContentOf(this.documentState.contentId, content);
  }
}

const LOREM_IPSUMS = '<p>Hello <b>Bold</b> is amzing</p>';
