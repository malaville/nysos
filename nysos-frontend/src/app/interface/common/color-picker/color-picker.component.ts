import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

export type HSLColor = [
  hue: number | undefined,
  saturation: number,
  luminance: number
];

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
})
export class ColorPickerComponent implements OnChanges {
  open = false;
  colorSelected: HSLColor | undefined;
  timer: number;

  @Input()
  colorSelectedCallback: (color: HSLColor | undefined) => void;

  @Input()
  colorPalette: HSLColor[];

  @Input()
  counterRotate: boolean = false;

  @Input()
  initialColor: HSLColor | undefined;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.initialColor) {
      this.colorSelected = undefined;
    }
  }

  colorPaletteClicked() {
    this.open = !this.open;
    if (this.open) {
      clearTimeout(this.timer);
      // @ts-ignore
      this.timer = setTimeout(() => {
        this.open = false;
      }, 3000);
    }
  }

  toHSL = (c: HSLColor) => `hsl( ${c[0]} , ${c[1]}% , ${c[2]}%)`;

  colorClicked(color: HSLColor | undefined) {
    this.colorSelectedCallback(color);
    this.colorSelected = color;
    this.initialColor = undefined;
  }
}
