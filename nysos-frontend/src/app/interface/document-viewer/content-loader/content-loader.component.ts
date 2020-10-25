import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-content-loader',
  templateUrl: './content-loader.component.html',
  styleUrls: ['./content-loader.component.css'],
})
export class ContentLoaderComponent implements OnInit {
  @Input() small: boolean = false;
  constructor() {}

  ngOnInit(): void {}
}
