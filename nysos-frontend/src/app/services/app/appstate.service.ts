import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';
import { BibliographyItem } from 'src/app/interface/source-manager/bibliography-item';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';

export interface DocumentDataStateInterface {
  name: string;
  contentId: string;
  content: string;
  edgeTargetId?: string;
  edgeSourceId?: string;
  bibliography: BibliographyItem;
  title?: string;
}

export interface UIStateInterface {
  addingDocument: boolean;
  editDocument: boolean;
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
    bibliography: undefined,
    name: undefined,
  };
  private documentStateBS = new BehaviorSubject(this.documentState);
  readonly documentStateObservable = this.documentStateBS.asObservable();

  readonly UIstate: UIStateInterface = {
    addingDocument: false,
    editDocument: false,
  };
  private UIstateBS = new BehaviorSubject(this.UIstate);
  readonly UIstateObservable = this.UIstateBS.asObservable();

  constructor(private cytoDb: CytodatabaseService) {}

  setSidenavRef(sidenavref: MatSidenav) {
    this.sidenavref = sidenavref;
  }

  contentSelected(
    id: string,
    name: string,
    edgeInfos: any = {},
    bibliography: BibliographyItem = undefined
  ) {
    this.documentState.name = name;
    this.documentState.contentId = id;
    this.documentState.content = this.cytoDb.loadContentOf(id);
    const { source, target } = edgeInfos;
    this.documentState.edgeSourceId = source || undefined;
    this.documentState.edgeTargetId = target || undefined;
    this.documentState.bibliography = bibliography;
    this.documentStateBS.next(this.documentState);

    // Closes the adding or editing document whenever selecting new content
    this.UIstate.addingDocument = false;
    this.UIstate.editDocument = false;
    this.UIstateBS.next(this.UIstate);
    this.sidenavref.open();
  }

  saveContent(content: string) {
    this.cytoDb.saveContentOf(this.documentState.contentId, content);
  }

  saveContentOf(id: string, content: string): Promise<boolean> {
    return this.cytoDb.saveContentOf(id, content);
  }

  openNewDocument(editDocument = false) {
    if (this.UIstate.editDocument || this.UIstate.addingDocument) {
      this.UIstate.editDocument = false;
      this.UIstate.addingDocument = false;
    } else {
      if (editDocument) {
        this.UIstate.editDocument = true;
        this.UIstate.addingDocument = false;
      } else {
        this.UIstate.editDocument = false;
        this.UIstate.addingDocument = true;
      }
    }
    this.UIstateBS.next(this.UIstate);
  }

  closeNewDocument() {
    this.UIstate.addingDocument = false;
    this.UIstate.editDocument = false;
    this.UIstateBS.next(this.UIstate);
  }

  refreshDocummentState() {
    this.documentStateBS.next(this.documentState);
  }
}

const LOREM_IPSUMS = '<p>Hello <b>Bold</b> is amzing</p>';
