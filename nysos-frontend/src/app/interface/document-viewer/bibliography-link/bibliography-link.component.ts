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
export class BibliographyLinkComponent implements OnInit {
  @Input() bib: BibliographyItemLink;
  @Input() linkDescriptionChange: (id: string, desc: string) => void;
  @ViewChild('doclinkdesc') div: ElementRef;

  // private contentBS =
  constructor(private cytostate: CytostateService) {}

  // ngAfterViewInit() {
  //   this.div.nativeElement.innerHTML = this.bib.description;
  // }

  onDocumentClicked() {
    this.cytostate.selectContent(this.bib.contentId);
  }

  onBiblioLinkDescriptionChange(content) {
    this.linkDescriptionChange(this.bib.linkid, content);
  }

  onEnter() {
    this.div.nativeElement.blur();
  }

  onDeleteDocumentLinkClicked() {
    this.cytostate.handleDeleteElement(this.bib.linkid);
  }

  ngOnInit(): void {}
}
