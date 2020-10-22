import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
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
  contentBS = new ReplaySubject<{ contentId: string; content: string }>(1);
  loading = false;
  saved = true;
  writing = false;

  @Input() large: boolean;

  constructor(
    private cytostate: CytostateService,
    private appState: AppstateService
  ) {}

  ngOnInit() {
    this.documentStateObs = this.appState.documentStateObservable;
    this.bibliography = this.documentStateObs.pipe(
      tap(() => {
        this.saved = true;
      }),
      map((doc) => this.cytostate.findBibliographyAbout(doc.contentId) || [])
    );
    this.contentBS
      .asObservable()
      .pipe(
        tap(() => {
          this.loading = false;
          this.saved = false;
          this.writing = true;
        }),
        debounceTime(1000)
      )
      .subscribe((content) => {
        this.writing = false;
        this.loading = true;
        this.appState
          .saveContentOf(content.contentId, content.content)
          .then(() => {
            this.loading = false;
            this.saved = true;
          });
      });
  }

  onDescriptionChange(content) {
    this.contentBS.next({
      contentId: this.appState.documentState.contentId,
      content,
    });
    // this.appState.saveContent(content);
  }

  onLinkDescriptionChangeCallback = () => (id: string, description: string) =>
    this.appState.saveContentOf(id, description);

  newDocumentClicked() {
    this.appState.openNewDocument(!!this.appState.documentState.bibliography);
  }

  addAChildClicked = () => {
    this.cytostate.addChildToCurrentNode();
  };
}
