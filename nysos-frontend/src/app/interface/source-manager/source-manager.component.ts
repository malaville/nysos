import { Input, OnChanges } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, tap } from 'rxjs/operators';
import { AppstateService } from 'src/app/services/app/appstate.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { BibliographyItem } from './bibliography-item';

@Component({
  selector: 'app-source-manager',
  templateUrl: './source-manager.component.html',
  styleUrls: ['./source-manager.component.css'],
})
export class SourceManagerComponent implements OnChanges {
  myForm: FormGroup;
  public myreg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  @Input() bibliographyId: string;

  constructor(private fb: FormBuilder, private cytostate: CytostateService) {
    this.myForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      acronym: ['', Validators.maxLength(10)],
      link: ['', [Validators.pattern(this.myreg)]],
      year: [
        2020,
        [Validators.min(1000), Validators.max(2030), Number.isInteger],
      ],
      author: ['', [Validators.required, Validators.minLength(8)]],
    });
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
    console.log('Submit Clicked');
    if (this.myForm.valid && this.myForm.dirty) {
      const bib = BibliographyItem.fromFormGroup(this.myForm);
      if (this.bibliographyId) {
        console.log('Bibliography modified', this.bibliographyId);
        this.cytostate.modifyBibliography(this.bibliographyId, bib);
      } else {
        this.cytostate.addBibliography(bib);
      }
      console.log(bib.acronym);
    }
  }
}
