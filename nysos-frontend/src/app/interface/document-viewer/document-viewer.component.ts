import { Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AppstateService,
  DocumentDataStateInterface,
} from 'src/app/services/app/appstate.service';
import { CytodatabaseService } from 'src/app/services/cytodatabase/cytodatabase.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { BibliographyItemLink } from '../source-manager/bibliography-item';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
})
export class DocumentViewerComponent {
  public bibliography: Observable<BibliographyItemLink[]> = of([]);
  documentStateObs: Observable<DocumentDataStateInterface>;
  @Input() large: boolean;

  constructor(
    private cytostate: CytostateService,
    private appState: AppstateService,
    private cytoDb: CytodatabaseService
  ) {}

  ngOnInit() {
    this.documentStateObs = this.appState.documentStateObservable;
    this.bibliography = this.documentStateObs.pipe(
      map((doc) => this.cytostate.findBibliographyAbout(doc.contentId) || [])
    );
  }

  onDescriptionChange(content) {
    this.appState.saveContent(content);
  }

  onLinkDescriptionChangeCallback = () => (id: string, description: string) => {
    this.cytoDb.saveContentOf(id, description);
  };

  newDocumentClicked() {
    this.appState.openNewDocument(!!this.appState.documentState.bibliography);
  }

  addAChildClicked = () => {
    this.cytostate.addChildToCurrentNode();
  };
}
