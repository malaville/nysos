import { Component, OnInit, Input } from '@angular/core';
import { BibliographyItem } from '../../source-manager/bibliography-item';

@Component({
  selector: 'app-bibliography-details',
  templateUrl: './bibliography-details.component.html',
  styleUrls: ['./bibliography-details.component.css'],
})
export class BibliographyDetailsComponent implements OnInit {
  @Input() bibliography: BibliographyItem;

  @Input() editDocumentClicked: () => void;

  constructor() {}

  ngOnInit(): void {}
}
