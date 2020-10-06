import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentDataStateInterface } from 'src/app/services/app/appstate.service';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
})
export class DocumentViewerComponent implements OnInit {
  private temporaryTitle = '';
  titleWasChanged = false;

  ngOnInit() {}

  constructor() {}

  @Input() documentStateObs: Observable<DocumentDataStateInterface>;

  onDescriptionChange(content) {
    console.log('Content was changed ... _', content);
  }
  onTitleChange(content) {
    this.titleWasChanged = true;
    this.temporaryTitle = content;
  }
  onTitleOut() {
    console.log(`titleout , saving ... __${this.temporaryTitle}_`);
    this.titleWasChanged = false;
  }
}
