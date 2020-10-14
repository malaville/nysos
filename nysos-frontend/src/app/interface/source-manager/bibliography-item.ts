import { FormGroup } from '@angular/forms';

export class BibliographyItem {
  id: string;

  constructor(
    public title = '',
    public link = '',
    public description = '',
    public acronym = 'DOC',
    public author = '',
    public year = new Date().getFullYear(),
    public targets: string[] = ['2303874987398739'],
    public specificDescriptions: { [id: string]: string } = {}
  ) {}

  static fromFormGroup(fg: FormGroup) {
    console.assert(fg.value.title);
    console.assert(fg.value.acronym);
    console.assert(fg.value.acronym);
    console.assert(fg.value.year);
    console.assert(fg.value.author);
    return new BibliographyItem(
      fg.value.title,
      fg.value.link,
      fg.value.description,
      fg.value.acronym,
      fg.value.author,
      fg.value.year
    );
  }
}
