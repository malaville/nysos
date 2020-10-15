import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { BibliographyItem } from '../../source-manager/bibliography-item';

@Component({
  selector: 'app-document-title',
  templateUrl: './document-title.component.html',
  styleUrls: ['./document-title.component.css'],
})
export class DocumentTitleComponent implements OnInit {
  @Input() newDocumentClicked: () => void;
  @Input() bibliography: BibliographyItem;

  constructor(private cytostate: CytostateService) {}

  ngOnInit(): void {}

  @ViewChild('name') h1: ElementRef;
  private temporaryName = '';
  private nameWasChanged = false;
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
}
