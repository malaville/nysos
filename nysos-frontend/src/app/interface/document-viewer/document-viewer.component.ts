import { Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import {
  AppstateService,
  DocumentDataStateInterface,
} from 'src/app/services/app/appstate.service';
import { AsyncContentStateInterface } from 'src/app/services/cytodatabase/asyncContent';
import { CytodatabaseService } from 'src/app/services/cytodatabase/cytodatabase.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { GeneralStateService } from 'src/app/services/general-state.service';
import { Color } from '../common/color-picker/color-picker.component';
import { BibliographyItemLink } from '../source-manager/bibliography-item';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
})
export class DocumentViewerComponent {
  public bibliography: BibliographyItemLink[] = [];
  public documentState: DocumentDataStateInterface;
  asyncContentState: Observable<AsyncContentStateInterface>;
  @Input() large: boolean;
  isEdgeOrDocument: boolean;

  constructor(
    private cytostate: CytostateService,
    private appState: AppstateService,
    private cytoDb: CytodatabaseService,
    private genState: GeneralStateService
  ) {}

  ngOnInit() {
    this.appState.documentStateObservable.subscribe((documentState) => {
      this.documentState = documentState;
      if (documentState.contentId) {
        this.bibliography = this.cytostate.findBibliographyAbout(
          documentState.contentId
        );
      } else {
        this.bibliography = [];
      }
    });
    this.appState.documentStateObservable.subscribe((state) => {
      this.isEdgeOrDocument = !!state.edgeSourceId || !!state.bibliography;
      this.asyncContentState = state.asyncContent?.asyncContentState!;
    });
  }

  onDescriptionChange(content) {
    this.appState.saveContent(content);
  }

  onLinkDescriptionChangeCallback = () => (id: string, description: string) => {
    this.cytoDb.saveDataOrContentOf(id, description);
  };

  newDocumentClicked() {
    this.appState.openNewDocument(!!this.appState.documentState.bibliography);
  }

  addAChildClicked = () => {
    const currentId = this.appState.documentState.contentId;
    currentId &&
      this.cytostate.addChildToCurrentNode(currentId) &&
      this.appState.sidenavref.close();
  };

  deleteElementClicked = () => {
    const edges =
      this.appState.documentState.contentId &&
      this.cytostate.deleteFocusedElement(
        this.appState.documentState.contentId
      );
  };

  closePanelClicked = () => this.appState.unselectContent();

  searchClicked = () => this.genState.openSearchBarClicked();

  colorSelectedCallback = () => (color: Color) => {
    const contentId = this.appState.documentState.contentId;
    contentId && this.cytostate.setColor(contentId, color);
  };
}
