import { FormGroup, Validators } from '@angular/forms';
const myreg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

export class BibliographyItem {
  id: string;

  constructor(
    public title = '',
    public link = '',
    public acronym = '',
    public author = '',
    public year = new Date().getFullYear(),
    public contentId = undefined
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
      fg.value.acronym,
      fg.value.author,
      fg.value.year
    );
  }

  static fromEdge(
    cyEdge: cytoscape.CollectionReturnValue | cytoscape.SingularElementArgument
  ) {
    const data = cyEdge.data();
    const id = cyEdge.id();
    return new BibliographyItem(
      data.title,
      data.link,
      data.name,
      data.author,
      data.year,
      id
    );
  }

  toEdgeData() {
    const data = { ...this, name: this.acronym };
    delete data['acronym'];
    return data;
  }

  toFormGroupObject() {
    return {
      title: [this.title, [Validators.required, Validators.minLength(10)]],
      acronym: [this.acronym, Validators.maxLength(10)],
      link: [this.link, [Validators.pattern(myreg)]],
      year: [
        this.year,
        [Validators.min(1000), Validators.max(2030), Number.isInteger],
      ],
      author: [this.author, [Validators.required, Validators.minLength(8)]],
    };
  }
}
