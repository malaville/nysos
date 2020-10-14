import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AppstateService,
  DocumentDataStateInterface,
} from 'src/app/services/app/appstate.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
})
export class DocumentViewerComponent implements AfterViewInit {
  private temporaryName = '';
  private nameWasChanged = false;
  public bibliography = [];

  constructor(
    private cytostate: CytostateService,
    private appState: AppstateService
  ) {}

  @ViewChild('name') h1: ElementRef;

  ngAfterViewInit() {
    this.documentStateObs
      .pipe(map((docState) => docState.name))
      .subscribe((name) => {
        this.h1.nativeElement.innerHTML = name;
        if (!name) {
          setTimeout(() => this.h1.nativeElement.focus(), 500);
        }
        this.findBibliography();
      });
  }

  @Input() documentStateObs: Observable<DocumentDataStateInterface>;

  onDescriptionChange(content) {
    this.appState.saveContent(content);
  }
  onNameChange(content) {
    this.nameWasChanged = true;
    this.temporaryName = content;
  }

  unFocus() {
    this.h1.nativeElement.blur();
  }
  onNameOut() {
    if (this.nameWasChanged) {
      this.cytostate.changeNodeName(this.temporaryName);
    }
    this.nameWasChanged = false;
    this.temporaryName = '';
  }
  onTitleChange(content) {}

  onTitleOut() {}

  findBibliography() {
    this.bibliography =
      this.cytostate.findBibliographyAbout(
        this.appState.documentState.contentId
      ) || [];
  }
}
