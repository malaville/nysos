import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';
export interface DocumentDataStateInterface {
  title: string;
  contentId: string;
  content: string;
  edgeTargetId?: string;
  edgeSourceId?: string;
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
  };
  private documentStateBS = new BehaviorSubject(this.documentState);
  readonly documentStateObservable = this.documentStateBS.asObservable();

  constructor(private cytoDb: CytodatabaseService) {}

  setSidenavRef(sidenavref: MatSidenav) {
    this.sidenavref = sidenavref;
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
