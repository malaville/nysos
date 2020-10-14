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
export class SourceManagerComponent implements OnInit {
  myForm: FormGroup;
  public myreg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  constructor(private fb: FormBuilder, private cytostate: CytostateService) {
    this.myForm = this.fb.group({
      title: ['This is the title', [Validators.required]],
      acronym: ['DOC', Validators.maxLength(10)],
      link: ['', [Validators.pattern(this.myreg)]],
      year: [
        2020,
        [Validators.min(1000), Validators.max(2030), Number.isInteger],
      ],
      author: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.myForm.valueChanges
      .pipe(filter(() => this.myForm.valid && this.myForm.dirty))
      .subscribe((formValue) => console.log(formValue));
  }

  submitClicked(): void {
    console.log('Submit Clicked');
    if (this.myForm.valid && this.myForm.dirty) {
      console.log('Valid & Dirty');
      const bib = BibliographyItem.fromFormGroup(this.myForm);
      this.cytostate.addBibliography(bib);
    }
  }
}
