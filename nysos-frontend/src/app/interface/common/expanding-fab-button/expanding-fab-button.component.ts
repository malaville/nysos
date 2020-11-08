import { Component, ElementRef, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-expanding-fab-button',
  templateUrl: './expanding-fab-button.component.html',
  styleUrls: ['./expanding-fab-button.component.css'],
})
export class ExpandingFabButtonComponent implements OnInit {
  @Input() onClick: () => void;
  @Input() color: string = 'primary';
  @Input() iconName: string;
  @Input('rotate90') rotate90: boolean = false;
  @Input('open') appOpen: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}

import { Directive } from '@angular/core';

@Directive({
  selector: 'app-expanding-fab-button[rotate90]',
})
export class Rotate90Directive {
  constructor(el: ExpandingFabButtonComponent) {
    el.rotate90 = true;
  }
}

@Directive({
  selector: 'app-expanding-fab-button[appOpen]',
})
export class OpenButtonDirective {
  constructor(el: ExpandingFabButtonComponent) {
    el.appOpen = true;
  }
}
