import { Component, Input, OnInit } from '@angular/core';

export type Color = [
  hue: number | undefined,
  saturation: number,
  luminance: number
];

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
})
export class ColorPickerComponent implements OnInit {
  open = false;
  colorSelected: Color | undefined;
  timer: number;
  @Input()
  colorSelectedCallback: (color: Color | undefined) => void;

  @Input()
  colorPalette: Color[];

  @Input()
  counterRotate: boolean = false;

  constructor() {}

  ngOnInit(): void {}

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

  toHSL = (c: Color) => `hsl( ${c[0]} , ${c[1]}% , ${c[2]}%)`;

  colorClicked(color: Color | undefined) {
    this.colorSelectedCallback(color);
    this.colorSelected = color;
  }
}
