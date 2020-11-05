import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { GroupingToolComponent } from 'src/app/interface/grouping-tool/grouping-tool.component';
import { BibliographyItem } from 'src/app/interface/source-manager/bibliography-item';
import { AsyncContent } from '../cytodatabase/asyncContent';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';

export interface DocumentDataStateInterface {
  name: string;
  contentId: string;
  content: string;
  edgeTargetId?: string;
  edgeSourceId?: string;
  bibliography: BibliographyItem;
  title?: string;
  asyncContent: AsyncContent;
}

const defaultDocumentState: DocumentDataStateInterface = {
  title: undefined,
  contentId: undefined,
  content: undefined,
  bibliography: undefined,
  name: undefined,
  asyncContent: undefined,
};

export interface UIStateInterface {
  addingDocument: boolean;
  editDocument: boolean;
  groupingMode: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AppstateService {
  sidenavref: MatSidenav;
  dialogRef: MatDialogRef<GroupingToolComponent>;

  readonly documentState: DocumentDataStateInterface = defaultDocumentState;
  private documentStateBS = new BehaviorSubject(this.documentState);
  readonly documentStateObservable = this.documentStateBS.asObservable();

  readonly UIstate: UIStateInterface = {
    addingDocument: false,
    editDocument: false,
    groupingMode: false,
  };
  private UIstateBS = new BehaviorSubject(this.UIstate);
  readonly UIstateObservable = this.UIstateBS.asObservable();

  constructor(private cytoDb: CytodatabaseService, public dialog: MatDialog) {}

  setSidenavRef(sidenavref: MatSidenav) {
    this.sidenavref = sidenavref;
  }

  unselectContent() {
    for (let key of Object.keys(this.documentState)) {
      this.documentState[key] = undefined;
    }
    this.documentStateBS.next(this.documentState);
    this.sidenavref.close();
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
    this.documentState.asyncContent = this.cytoDb.loadRemoteContentOf(id);
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
    this.cytoDb.saveDataOrContentOf(this.documentState.contentId, content);
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

  toggleGroupingMode() {
    this.UIstate.groupingMode = !this.UIstate.groupingMode;
    this.UIstateBS.next(this.UIstate);
    if (this.UIstate.groupingMode) {
      this.dialogRef = this.dialog.open(GroupingToolComponent, {
        disableClose: true,
      });
      this.dialogRef.componentInstance.config = {
        closeFunction: () => this.toggleGroupingMode(),
      };
    } else {
      this.dialogRef.close();
    }
  }
}

const LOREM_IPSUMS = '<p>Hello <b>Bold</b> is amzing</p>';
