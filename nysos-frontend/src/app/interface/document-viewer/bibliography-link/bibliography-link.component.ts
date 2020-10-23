import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { BibliographyItemLink } from '../../source-manager/bibliography-item';

@Component({
  selector: 'app-bibliography-link',
  templateUrl: './bibliography-link.component.html',
  styleUrls: ['./bibliography-link.component.css'],
})
export class BibliographyLinkComponent implements OnInit, AfterViewInit {
  @Input() bib: BibliographyItemLink;
  @Input() linkDescriptionChange: (id: string, desc: string) => void;
  @ViewChild('doclinkdesc') div: ElementRef;

  // private contentBS =
  constructor(private cytostate: CytostateService) {}

  ngAfterViewInit() {
    this.div.nativeElement.innerHTML = this.bib.description;
  }

  onDocumentClicked(documentId: string) {
    this.cytostate.selectContent(documentId);
  }

  onBiblioLinkDescriptionChange(content) {
    this.linkDescriptionChange(this.bib.linkid, content);
  }

  onEnter() {
    this.div.nativeElement.blur();
  }

  ngOnInit(): void {}
}
