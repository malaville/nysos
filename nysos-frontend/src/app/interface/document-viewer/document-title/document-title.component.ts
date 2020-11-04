import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppstateService } from 'src/app/services/app/appstate.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { BibliographyItem } from '../../source-manager/bibliography-item';

@Component({
  selector: 'app-document-title',
  templateUrl: './document-title.component.html',
  styleUrls: ['./document-title.component.css'],
})
export class DocumentTitleComponent implements OnInit {
  @Input() bibliography: BibliographyItem;

  constructor(
    private cytostate: CytostateService,
    private appState: AppstateService
  ) {}

  ngOnInit(): void {}

  @ViewChild('name') h1: ElementRef;
  private temporaryName = '';
  private nameWasChanged = false;

  onNameChange(content) {
    this.nameWasChanged = true;
    this.temporaryName = content;
  }

  ngAfterViewInit() {
    this.appState.documentStateObservable
      .pipe(map((docState) => docState.name))
      .subscribe((name) => {
        if (name) {
          this.h1.nativeElement.innerHTML = name;
        }
        if (!name) {
          setTimeout(() => this.h1.nativeElement.focus(), 500);
        }
      });
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
