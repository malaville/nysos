import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as bibtex from 'bibtex';
import { BibliographyItem } from '../bibliography-item';
enum MODES {
  IDLE = 0,
  ADDING = 1,
}

@Component({
  selector: 'app-import-bibtex-button',
  templateUrl: './import-bibtex-button.component.html',
  styleUrls: ['./import-bibtex-button.component.css'],
})
export class ImportBibtexButtonComponent {
  MODE: MODES;
  bibtexForm = new FormControl('', [Validators.required]);

  @Output()
  onBibtexParsed = new EventEmitter<BibliographyItem>();

  constructor() {}

  importRefClicked($event: Event) {
    $event.preventDefault();
    this.MODE = MODES.ADDING;
  }

  addClicked($event?: Event) {
    $event?.preventDefault();
    if (this.bibtexForm.valid) {
      const parsedBib = this.parseBibtex(this.bibtexForm.value);
      this.onBibtexParsed.emit(parsedBib);
      this.MODE = MODES.IDLE;
    }
  }

  enterDown() {
    this.addClicked();
  }

  parseMonth(month: string | number): number {
    if (typeof month == 'number') {
      return month - 1;
    }
    if (typeof month == 'string') {
      const threeFirstLetters = month.slice(0, 3).toLowerCase();
      const dict = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12,
      };
      return dict[threeFirstLetters] - 1 || 0;
    }
  }

  parseBibtex(bibTexString: string): BibliographyItem {
    const bibX = bibtex.parseBibFile(bibTexString);
    const usedFields = [];
    const notFoundFields = [];
    const fields = Object.keys(bibX.entries_raw[0].fields);
    const bib = new BibliographyItem();

    if (bibX.entries_raw[0]._id) {
      usedFields.push('_id');
      bib.acronym = bibX.entries_raw[0]._id;
    } else {
      notFoundFields.push('_id');
    }

    if (fields.includes('title')) {
      usedFields.push('title');
      bib.title = bibtex
        .normalizeFieldValue(bibX.entries_raw[0].getField('title'))
        .toString();
    } else {
      notFoundFields.push('title');
    }

    if (fields.includes('author')) {
      usedFields.push('author');
      bib.authors = bibtex
        .normalizeFieldValue(bibX.entries_raw[0].getField('author'))
        .toString()
        .split(' and ');
    } else {
      notFoundFields.push('author');
    }

    if (fields.includes('doi')) {
      usedFields.push('doi');
      bib.doi = bibtex
        .normalizeFieldValue(bibX.entries_raw[0].getField('doi'))
        .toString();
    } else {
      notFoundFields.push('doi');
    }
    if (fields.includes('journal')) {
      usedFields.push('journal');
      bib.journal = bibtex
        .normalizeFieldValue(bibX.entries_raw[0].getField('journal'))
        .toString();
    } else {
      notFoundFields.push('journal');
    }

    if (fields.includes('year')) {
      usedFields.push('year');
      const dt = new Date();
      const year = parseInt(
        bibtex.normalizeFieldValue(bibX.entries_raw[0].getField('year')) + ''
      );
      dt.setUTCFullYear(year);
      dt.setUTCMonth(1);
      dt.setUTCDate(1);
      if (fields.includes('month')) {
        usedFields.push('month');
        const month = bibtex.normalizeFieldValue(
          bibX.entries_raw[0].getField('month')
        );

        dt.setUTCMonth(this.parseMonth(month));
        bib.date = dt.toISOString();
      } else {
        notFoundFields.push('month');
        bib.date = dt.toISOString();
      }
    } else {
      notFoundFields.push('year', 'month');
    }

    console.log('The parser used those fields', usedFields);
    console.log('The parser didn t find those fields : ', notFoundFields);
    const fieldsSet = new Set(fields);
    usedFields.forEach((field) => fieldsSet.delete(field));
    console.log(
      "The bibtex also had those fields that we don't knows what to do about",
      fieldsSet
    );

    const otherData = {};
    fieldsSet.forEach((field) => {
      otherData[field] = bibtex.normalizeFieldValue(
        bibX.entries_raw[0].getField(field)
      );
    });
    bib.otherData = otherData;

    return bib;
  }
}
