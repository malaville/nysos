import { FormGroup, Validators } from '@angular/forms';
import { AsyncContent } from 'src/app/services/cytodatabase/asyncContent';

export class BibliographyItem {
  constructor(
    public title = '',
    public link = '',
    public acronym = '',
    public author = '',
    public year = new Date().getFullYear(),
    public contentId: undefined | string = undefined
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

  static fromNode(cyNode: cytoscape.NodeSingular) {
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
    const data: any = { ...this, name: this.acronym };
    delete data['acronym'];
    return data;
  }

  toFormGroupObject() {
    return {
      title: [this.title, [Validators.required, Validators.minLength(10)]],
      acronym: [this.acronym, Validators.maxLength(10)],
      link: [this.link, []],
      year: [
        this.year,
        [Validators.min(1000), Validators.max(2030), Number.isInteger],
      ],
      author: [this.author, [Validators.required, Validators.minLength(8)]],
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
      bib.author,
      bib.year,
      bib.contentId
    );
  }
}
