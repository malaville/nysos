import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentDataStateInterface } from 'src/app/services/app/appstate.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
})
export class DocumentViewerComponent implements AfterViewInit {
  private temporaryTitle = '';
  private titleWasChanged = false;

  constructor(private cytostate: CytostateService) {}

  @ViewChild('title') h1: ElementRef;

  ngAfterViewInit() {
    this.documentStateObs
      .pipe(map((docState) => docState.title))
      .subscribe((title) => {
        this.h1.nativeElement.innerHTML = title;
      });
  }

  @Input() documentStateObs: Observable<DocumentDataStateInterface>;

  onDescriptionChange(content) {
    console.log('Content was changed ... _', content);
  }
  onTitleChange(content) {
    this.titleWasChanged = true;
    this.temporaryTitle = content;
  }
  onTitleOut() {
    if (this.titleWasChanged) {
    this.cytostate.changeNodeName(this.temporaryTitle);
    }
    this.titleWasChanged = false;
    this.temporaryTitle = '';
  }
}
