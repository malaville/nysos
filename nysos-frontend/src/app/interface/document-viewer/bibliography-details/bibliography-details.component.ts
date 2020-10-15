import { Component, OnInit, Input } from '@angular/core';
import { AppstateService } from 'src/app/services/app/appstate.service';
import { BibliographyItem } from '../../source-manager/bibliography-item';

@Component({
  selector: 'app-bibliography-details',
  templateUrl: './bibliography-details.component.html',
  styleUrls: ['./bibliography-details.component.css'],
})
export class BibliographyDetailsComponent implements OnInit {
  @Input() bibliography: BibliographyItem;

  constructor(private appState: AppstateService) {}

  ngOnInit(): void {}

  editDocumentClicked() {
    this.appState.openNewDocument(!!this.appState.documentState.bibliography);
  }
}
