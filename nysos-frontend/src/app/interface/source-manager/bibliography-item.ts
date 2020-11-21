import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AsyncContent } from 'src/app/services/cytodatabase/asyncContent';

export class BibliographyItem {
  constructor(
    public title = '',
    public link = '',
    public acronym = '',
    public authors = [''],
    public date = new Date().toISOString(),
    public contentId = undefined,
    public doi = '',
    public referenceType: string = undefined,
    public journal = ''
  ) {}

  static fromFormGroup(fg: FormGroup) {
    console.log(fg.value);
    console.assert(fg.value.title);
    console.assert(fg.value.acronym);
    console.assert(fg.value.acronym);
    console.assert(fg.value.date);
    console.assert(fg.value.authors);
    console.assert(fg.value.doi);
    console.assert(fg.value.referenceType);
    return new BibliographyItem(
      fg.value.title,
      fg.value.link,
      fg.value.acronym,
      fg.value.authors,
      fg.value.date.toIsoString(),
      undefined,
      fg.value.doi,
      fg.value.referenceType,
      fg.value.journal
    );
  }

  static fromNode(cyNode: cytoscape.NodeSingular) {
    const data = cyNode.data();
    const id = cyNode.id();
    return new BibliographyItem(
      data.title,
      data.link,
      data.name,
      data.author,
      data.date,
      id,
      data.doi,
      data.referenceType,
      data.journal
    );
  }

  toNodeData() {
    const data = { ...this, name: this.acronym };
    delete data['acronym'];
    return data;
  }

  toFormGroupObject() {
    return {
      title: [this.title, [Validators.required, Validators.minLength(10)]],
      acronym: [this.acronym, Validators.maxLength(10)],
      link: [this.link, []],
      date: [new Date(this.date)],
      authors: new FormArray(
        this.authors.map((author) => new FormControl(author))
      ),
      doi: [this.doi],
      referenceType: [this.referenceType],
      journal: [this.journal],
    };
  }
}

export class BibliographyItemLink extends BibliographyItem {
  constructor(
    bib: BibliographyItem,
    public description = '',
    public linkid = '',
    readonly asyncDescription: AsyncContent
  ) {
    super(
      bib.title,
      bib.link,
      bib.acronym,
      bib.authors,
      bib.date,
      bib.contentId,
      bib.doi,
      bib.referenceType,
      bib.journal
    );
  }
}
