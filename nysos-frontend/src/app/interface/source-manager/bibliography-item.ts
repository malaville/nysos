import { FormGroup, Validators } from '@angular/forms';
const myreg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

export class BibliographyItem {
  id: string;

  constructor(
    public title = 'This is a random title',
    public link = '',
    public acronym = 'RND',
    public author = 'Alban Gauthier',
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

  static fromNode(
    cyNode: cytoscape.CollectionReturnValue | cytoscape.SingularElementArgument
  ) {
    const data = cyNode.data();
    const id = cyNode.id();
    return new BibliographyItem(
      data.title,
      data.link,
      data.name,
      data.author,
      data.year,
      id
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
      link: [this.link, [Validators.pattern(myreg)]],
      year: [
        this.year,
        [Validators.min(1000), Validators.max(2030), Number.isInteger],
      ],
      author: [this.author, [Validators.required, Validators.minLength(8)]],
    };
  }
}

export class BibliographyItemLink extends BibliographyItem {
  constructor(bib: BibliographyItem, public description = '') {
    super(
      bib.title,
      bib.link,
      bib.acronym,
      bib.author,
      bib.year,
      bib.contentId
    );
  }
}
