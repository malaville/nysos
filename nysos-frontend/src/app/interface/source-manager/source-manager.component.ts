import { Input, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BibliographyItem } from './bibliography-item';
import { SourceManagerService } from './source-manager.service';

@Component({
  selector: 'app-source-manager',
  templateUrl: './source-manager.component.html',
  styleUrls: ['./source-manager.component.css'],
  providers: [SourceManagerService],
})
export class SourceManagerComponent {
  @Input() open: boolean;
  // Used to trigger ngOnChanges() when closing opening the panel

  title: Observable<string>;

  constructor(public sourceManagerController: SourceManagerService) {}

  submitClicked(): void {
    this.sourceManagerController.submit();
  }

  mockDataClicked(): void {
    this.sourceManagerController.mockData();
  }

  addAuthorClicked() {
    console.log('addAuthorClick');
    this.sourceManagerController.addAuthorClicked();
  }

  deleteAuthorClicked(index: number) {
    this.sourceManagerController.deleteAuthorClicked(index);
  }

  onBibtexParsed(bib: BibliographyItem) {
    this.sourceManagerController.handlePushedBibliography(bib);
  }
}
