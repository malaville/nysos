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
  public bibliography: Observable<BibliographyItemLink[]> = of([]);
  documentStateObs: Observable<DocumentDataStateInterface>;
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
    this.documentStateObs = this.appState.documentStateObservable;
    this.appState.documentStateObservable.subscribe((state) => {
      this.isEdgeOrDocument = !!state.edgeSourceId || !!state.bibliography;
      this.asyncContentState = state.asyncContent?.asyncContentState;
    });

    this.bibliography = this.documentStateObs.pipe(
      map((doc) => this.cytostate.findBibliographyAbout(doc.contentId) || [])
    );
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
    this.cytostate.addChildToCurrentNode();
  };

  deleteElementClicked = () => {
    const edges = this.cytostate.deleteFocusedElement();
  };

  closePanelClicked = () => this.appState.unselectContent();

  searchClicked = () => this.genState.openSearchBarClicked();

  colorSelectedCallback = () => (color: Color) =>
    this.genState.colorSelected(color);
}
