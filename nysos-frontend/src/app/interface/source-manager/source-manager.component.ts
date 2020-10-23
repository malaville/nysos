import { Input, OnChanges, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
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

  @Input() bibliographyId: string;

  @Input() open: boolean;
  // Used to trigger ngOnChanges() when closing opening the panel

  @ViewChild('form') ngForm: NgForm;

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
      const bibliographItemFormGroup = this.cytostate
        .findBibliographyById(this.bibliographyId)
        .toFormGroupObject();
      this.myForm = this.fb.group(bibliographItemFormGroup);
    } else {
      this.ngForm?.resetForm();
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
    } else {
      this.myForm.controls.title.markAsTouched();
    }
  }

  mockDataClicked(): void {
    const randint = 1 + Math.floor(Math.random() * 100);
    this.myForm.patchValue({
      title: LOREM.slice(randint, randint + 3).join(' '),
      acronym: LOREM[randint - 1].slice(0, 7).toUpperCase(),
      author: 'Lorem Author',
      link: 'https://google.com',
      year: 2022,
    });
    this.myForm.markAsDirty();
  }
}

const LOREM = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'.split(
  ' '
);
