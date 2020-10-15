import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AppstateService,
  DocumentDataStateInterface,
} from 'src/app/services/app/appstate.service';
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

  constructor(
    private cytostate: CytostateService,
    private appState: AppstateService
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

  onLinkDescriptionChangeCallback = () => (id: string, description: string) =>
    this.appState.saveContentOf(id, description);

  newDocumentClicked() {
    this.appState.openNewDocument(!!this.appState.documentState.bibliography);
  }
}
