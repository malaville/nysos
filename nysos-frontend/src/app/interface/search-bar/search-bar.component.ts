import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import Fuse from 'fuse.js';

type Option = { name: string; id: string; hue: number };
@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {
  inputControl = new FormControl();
  _options: Fuse<Option>;
  initialOptions: Option[];
  xlheight: boolean = false;
  @Input()
  set options(options: Option[]) {
    this.initialOptions = options
      .filter((option) => option.name)
      .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
    this._options = new Fuse(options, { keys: ['name'] });
  }
  @Input() optionSelected: (id: string) => void;
  filteredOptions: Option[];

  ngOnInit() {
    this.inputControl.valueChanges.pipe(startWith('')).subscribe((value) => {
      this.filteredOptions = this._filter(value);
      this.xlheight = false;
    });
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

  getHue(option: Option): string {
    return option.hue ? `hsl( ${option.hue}, 70%, 40%)` : 'lightgray';
  }

  onKeyDown($event) {
    console.log($event.key);
    console.log($event.key === 'ArrowDown', !this.inputControl.value);
    if ($event.key === 'ArrowDown' && !this.inputControl.value) {
      this.filteredOptions = this.initialOptions;
      this.xlheight = true;
    }
  }
}
