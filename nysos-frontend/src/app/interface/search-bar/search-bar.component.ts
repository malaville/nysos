import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {
  inputControl = new FormControl();
  @Input() options: { name: string; id: string }[] = [];
  @Input() optionSelected: (id: string) => void;
  filteredOptions: Observable<{ name: string; id: string }[]>;

  ngOnInit() {
    this.filteredOptions = this.inputControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string | object): { name: string; id: string }[] {
    if (typeof value == 'object') return [];
    if (!value) return this.options;
    const filterValue = value?.toLowerCase();
    return this.options.filter(
      (option) => option.name?.toLowerCase().indexOf(filterValue) === 0
    );
  }

  getOptionName(option: { name: string; id: string }) {
    return option && option.name;
  }
}
