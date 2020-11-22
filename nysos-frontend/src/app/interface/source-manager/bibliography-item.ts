import { FormGroup } from '@angular/forms';
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
    public journal = '',
    public otherData: any = {}
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
      new Date(fg.value.date).toISOString(),
      undefined,
      fg.value.doi,
      fg.value.referenceType,
      fg.value.journal
    );
  }

  static fromNode(cyNode: cytoscape.NodeSingular) {
    const data = cyNode.data();
    console.log('FromNode', data);
    const id = cyNode.id();
    let authors = [];
    if (data.authors) {
      authors = data.authors;
    } else {
      authors = typeof data.author === 'string' ? [data.author] : data.author;
    }
    console.log('authors ', authors);
    return new BibliographyItem(
      data.title,
      data.link,
      data.name,
      authors,
      data.date,
      id,
      data.doi,
      data.referenceType,
      data.journal,
      data.otherData || {}
    );
  }

  toNodeData() {
    const data = { ...this, name: this.acronym };
    delete data['acronym'];
    return data;
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
