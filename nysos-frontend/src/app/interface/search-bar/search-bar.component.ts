import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Fuse from 'fuse.js';

type Option = { name: string; id: string };
@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {
  inputControl = new FormControl();
  _options: Fuse<Option>;
  initialOptions: Option[];
  @Input()
  set options(options: Option[]) {
    this.initialOptions = options;
    this._options = new Fuse(options, { keys: ['name'] });
  }
  @Input() optionSelected: (id: string) => void;
  filteredOptions: Observable<Option[]>;

  ngOnInit() {
    this.filteredOptions = this.inputControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string | object): Option[] {
    if (typeof value == 'object') return [];
    if (!value) return [];
    const filterValue = value?.toLowerCase();
    return this._options.search(filterValue);
  }

  getOptionName(option: Option) {
    return option && option.name;
  }
}
