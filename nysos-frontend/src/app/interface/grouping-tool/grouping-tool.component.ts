import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppstateService } from 'src/app/services/app/appstate.service';

@Component({
  selector: 'app-grouping-tool',
  templateUrl: './grouping-tool.component.html',
  styleUrls: ['./grouping-tool.component.css'],
})
export class GroupingToolComponent implements OnInit {
  public groupingMode: Observable<boolean> = of(false);

  constructor(private appState: AppstateService) {}

  ngOnInit(): void {
    this.groupingMode = this.appState.UIstateObservable.pipe(
      map((st) => st.groupingMode)
    );
  }
}
