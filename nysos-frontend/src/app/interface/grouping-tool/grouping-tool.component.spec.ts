import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupingToolComponent } from './grouping-tool.component';

describe('GroupingToolComponent', () => {
  let component: GroupingToolComponent;
  let fixture: ComponentFixture<GroupingToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupingToolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupingToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
