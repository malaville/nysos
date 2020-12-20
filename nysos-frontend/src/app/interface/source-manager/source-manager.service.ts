import { Injectable } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import {
  AppstateService,
  DocumentDataStateInterface,
} from 'src/app/services/app/appstate.service';
import { CytostateService } from 'src/app/services/cytostate/cytostate.service';
import { BibliographyItem } from './bibliography-item';

enum MODES {
  EDITING = 0,
  CREATING = 1,
}

@Injectable()
export class SourceManagerService {
  titleBS = new BehaviorSubject<string>('title');
  title$ = this.titleBS.asObservable();
  bibliographyForm: FormGroup;
  authors: FormArray;
  otherData: any;
  private bibliographyId: string;
  private MODE: MODES;

  constructor(
    private appState: AppstateService,
    private fb: FormBuilder,
    private cytostate: CytostateService
  ) {
    this.appState.documentStateObservable.subscribe((bib) =>
      this.handleDocumenStateChange(bib)
    );
  }

  handleDocumenStateChange(state: DocumentDataStateInterface) {
    if (state.isBibliography) {
      this.MODE = MODES.EDITING;
      this.bibliographyId = state.bibliography.contentId;
      this.handleBibliographyEditionMode(state.bibliography);
      return;
    }
    this.MODE = MODES.CREATING;
    this.handleBibliographyCreationMode();
  }

  handleBibliographyEditionMode(bibliography: BibliographyItem) {
    this.titleBS.next('🚩 🚩 Editing ... ' + bibliography.acronym);
    const nextBibliographyForm = this.fromBibliographyItem(bibliography);
    this.bibliographyForm = nextBibliographyForm;
    if (nextBibliographyForm.controls.authors instanceof FormArray) {
      this.authors = nextBibliographyForm.controls.authors;
    }
    this.otherData = bibliography.otherData;
  }

  handlePushedBibliography(bib: BibliographyItem) {
    this.handleBibliographyEditionMode(bib);
  }

  handleBibliographyCreationMode() {
    this.titleBS.next("You're creating a new reference");
    const nextBibliographyForm = this.fromBibliographyItem(
      new BibliographyItem()
    );
    this.bibliographyForm = nextBibliographyForm;
    if (nextBibliographyForm.controls.authors instanceof FormArray) {
      this.authors = nextBibliographyForm.controls.authors;
    }
  }

  fromBibliographyItem(bib: BibliographyItem) {
    const authorsControlArray = new FormArray(
      bib.authors.map((author) => new FormControl(author, Validators.required))
    );
    const fg = this.fb.group({
      title: [bib.title, [Validators.required, Validators.minLength(10)]],
      acronym: [bib.acronym, Validators.maxLength(10)],
      link: [bib.link, []],
      date: [new Date(bib.date)],
      authors: authorsControlArray,
      doi: [bib.doi, Validators.required],
      referenceType: [bib.referenceType],
      journal: [bib.journal],
    });
    return fg;
  }

  deleteAuthorClicked(index: number) {
    if (this.authors.length > 1) {
      this.authors.removeAt(index);
    }
  }

  addAuthorClicked() {
    this.authors.push(new FormControl('', Validators.required));
  }

  mockData() {
    const randint = 1 + Math.floor(Math.random() * 100);
    this.bibliographyForm.patchValue({
      title: LOREM.slice(randint, randint + 3).join(' '),
      acronym: LOREM[randint - 1].slice(0, 7).toUpperCase(),

      link: 'https://mock.google.com',
      year: 2022,
      doi: '10.1340/309mock',
      referenceType: 'Journal Article',
    });
    // this.authors.patchValue(['Well known author', 'Famousguy', 'amazing guy']);
    this.bibliographyForm.markAsDirty();
  }

  submit() {
    if (this.bibliographyForm.valid && this.bibliographyForm.dirty) {
      const bib = BibliographyItem.fromFormGroup(this.bibliographyForm);
      if (this.MODE == MODES.EDITING) {
        this.cytostate.modifyBibliography(this.bibliographyId, bib);
        return;
      }
      this.cytostate.addBibliography(bib);
      return;
    }
    this.bibliographyForm.controls.title.markAsTouched();
  }
}

const LOREM = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'.split(
  ' '
);
