import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { EdgeCollection, NodeCollection } from 'cytoscape';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';
import { GroupingToolComponent } from 'src/app/interface/grouping-tool/grouping-tool.component';
import { InfoModalComponent } from 'src/app/interface/info-modal/info-modal.component';
import { SearchBarComponent } from 'src/app/interface/search-bar/search-bar.component';
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
  infoModalOpened: boolean;
  searchBarOpened: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AppstateService {
  sidenavref: MatSidenav;
  dialogRef: MatDialogRef<GroupingToolComponent>;
  infoModalRef: MatDialogRef<InfoModalComponent>;
  searchBarModalRef: MatDialogRef<SearchBarComponent>;

  readonly documentState: DocumentDataStateInterface = defaultDocumentState;
  private documentStateBS = new BehaviorSubject(this.documentState);
  readonly documentStateObservable = this.documentStateBS.asObservable();

  readonly UIstate: UIStateInterface = {
    addingDocument: false,
    editDocument: false,
    groupingMode: false,
    infoModalOpened: false,
    searchBarOpened: false,
  };
  private UIstateBS = new BehaviorSubject(this.UIstate);
  readonly UIstateObservable = this.UIstateBS.asObservable();

  constructor(
    private cytoDb: CytodatabaseService,
    private matDialog: MatDialog
  ) {}

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

  openGroupingMode(
    nodes: NodeCollection,
    newParentingRelationsCallback: (edges: EdgeCollection) => void
  ) {
    this.UIstate.groupingMode = true;
    this.UIstateBS.next(this.UIstate);
    if (this.dialogRef) {
      this.dialogRef.close();
      delete this.dialogRef;
    }
    this.dialogRef = this.matDialog.open(GroupingToolComponent, {
      height: '60%',
      width: '60%',
      disableClose: true,
    });
    this.dialogRef.componentInstance.config = {
      closeFunction: () => this.closeGroupingMode(),
      newParentingRelationsCallback,
      nodes,
    };
  }

  public closeGroupingMode() {
    this.UIstate.groupingMode = false;
    this.UIstateBS.next(this.UIstate);
    this.dialogRef?.close();
  }

  public toggleInfoModal(forcedClose = false) {
    if (forcedClose) {
      this.UIstate.infoModalOpened = false;
    } else {
      this.UIstate.infoModalOpened = !this.UIstate.infoModalOpened;
    }
    this.UIstateBS.next(this.UIstate);
    if (this.UIstate.infoModalOpened) {
      this.infoModalRef = this.matDialog.open(InfoModalComponent, {
        width: '60%',
        minWidth: '300px',
      });
      this.infoModalRef
        .afterClosed()
        .pipe(first())
        .subscribe(() => {
          this.UIstate.infoModalOpened && this.toggleInfoModal();
        });
    } else {
      this.infoModalRef?.close();
    }
  }

  openSearchBar(
    keys: { name: string; id: string; hue: number }[],
    optionSelected: (id: string) => void
  ) {
    if (this.UIstate.searchBarOpened) return;
    this.UIstate.searchBarOpened = true;
    this.UIstateBS.next(this.UIstate);
    this.searchBarModalRef = this.matDialog.open(SearchBarComponent, {
      position: { top: '100px' },
      height: '80px',
      width: '700px',
      autoFocus: true,
      panelClass: 'custom-modalbox',
    });
    this.searchBarModalRef.componentInstance.options = keys;
    this.searchBarModalRef.componentInstance.optionSelected = optionSelected;
    this.searchBarModalRef
      .afterClosed()
      .pipe(first())
      .subscribe(() => this.closeSearchBar());
  }

  closeSearchBar() {
    this.UIstate.searchBarOpened = false;
    this.UIstateBS.next(this.UIstate);
    this.searchBarModalRef?.close();
  }
}
