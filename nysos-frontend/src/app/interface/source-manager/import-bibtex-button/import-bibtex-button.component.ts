import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
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

  constructor() {}

  importRefClicked($event: Event) {
    $event.preventDefault();
    this.MODE = MODES.ADDING;
  }

  addClicked($event?: Event) {
    $event?.preventDefault();
    this.MODE = MODES.IDLE;
  }

  enterDown() {
    this.addClicked();
  }
}
