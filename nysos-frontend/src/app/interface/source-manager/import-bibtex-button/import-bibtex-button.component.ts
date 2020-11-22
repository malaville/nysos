import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as bibtex from 'bibtex';
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
  bibtexForm = new FormControl('');
  fakeValue =
    ' @InProceedings{realscience,\
    author    = {Marteen Fredrik Adriaan ding de la Trumppert and مهدي N\\"allen and henQuq, jr, Mathize},\
    title     = {You Won\'t Believe This Proof That {P} \\gtreqqless {NP} Using Super-{T}uring Computation Near Big Black Holes},\
    booktitle = {Book of Qeq},\
    month     = {September},\
    year      = {2001},\
    address   = {Dordrecht},\
    publisher = {Willems Uitgeverij},\
    url       = {https://github.com/digitalheir/},\
    pages     = {6--9}\
  }';

  constructor() {}

  importRefClicked($event: Event) {
    $event.preventDefault();
    this.MODE = MODES.ADDING;
  }

  addClicked($event?: Event) {
    $event?.preventDefault();
    const bibX = bibtex.parseBibFile(this.fakeValue);
    console.log(bibX.entries_raw[0]._id);
    console.log(bibX.entries_raw[0].type);
    console.log(bibX.entries_raw[0].title$);
    console.log(
      bibtex.normalizeFieldValue(bibX.entries_raw[0].getField('title'))
    );
    console.log(
      bibtex
        .normalizeFieldValue(bibX.entries_raw[0].getField('author'))
        .toString()
        .split(' and ')
    );
    console.log(
      'url',
      bibtex.normalizeFieldValue(bibX.entries_raw[0].getField('url')).toString()
    );
    console.log(
      'doi',
      bibtex.normalizeFieldValue(bibX.entries_raw[0].getField('doi')).toString()
    );

    this.MODE = MODES.IDLE;
  }

  enterDown() {
    this.addClicked();
  }
}
