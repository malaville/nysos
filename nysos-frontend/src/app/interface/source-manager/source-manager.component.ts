import { Input, OnChanges } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppstateService } from 'src/app/services/app/appstate.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { BibliographyItem } from './bibliography-item';

@Component({
  selector: 'app-source-manager',
  templateUrl: './source-manager.component.html',
  styleUrls: ['./source-manager.component.css'],
})
export class SourceManagerComponent implements OnChanges, OnInit {
  myForm: FormGroup;
  public myreg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  @Input() bibliographyId: string;

  title: Observable<string>;

  constructor(
    private fb: FormBuilder,
    private cytostate: CytostateService,
    private appState: AppstateService
  ) {
    this.myForm = this.fb.group(new BibliographyItem().toFormGroupObject());
  }

  ngOnInit() {
    this.title = this.appState.UIstateObservable.pipe(
      map((uistate) =>
        uistate.addingDocument
          ? 'Add a new source to this theme'
          : uistate.editDocument
          ? 'Edit this source infos'
          : ''
      )
    );
  }

  ngOnChanges(): void {
    if (this.bibliographyId) {
      console.log('this.bibliographyId', this.bibliographyId);
      const bibliographItemFormGroup = this.cytostate
        .findBibliographyById(this.bibliographyId)
        .toFormGroupObject();
      this.myForm = this.fb.group(bibliographItemFormGroup);
    } else {
      this.myForm = this.fb.group(new BibliographyItem().toFormGroupObject());
    }
  }

  submitClicked(): void {
    if (this.myForm.valid && this.myForm.dirty) {
      const bib = BibliographyItem.fromFormGroup(this.myForm);
      if (this.bibliographyId) {
        this.cytostate.modifyBibliography(this.bibliographyId, bib);
      } else {
        this.cytostate.addBibliography(bib);
      }
      console.log(bib.acronym);
    }
  }
}
