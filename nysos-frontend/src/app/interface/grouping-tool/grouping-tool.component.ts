import { Component, Input, OnDestroy, OnInit } from '@angular/core';

interface GroupingToolComponentConfigInterface {
  closeFunction();
}
@Component({
  selector: 'app-grouping-tool',
  templateUrl: './grouping-tool.component.html',
  styleUrls: ['./grouping-tool.component.css'],
})
export class GroupingToolComponent implements OnInit, OnDestroy {
  @Input() config: GroupingToolComponentConfigInterface;

  constructor() {}

  ngOnInit(): void {
    console.log('OnInit');
  }

  ngOnDestroy(): void {
    console.log('OnDestroy');
  }

  onCloseClicked(): void {
    this.config.closeFunction();
  }
}
