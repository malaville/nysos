import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSaveStateIndicatorComponent } from './content-save-state-indicator.component';

describe('ContentSaveStateIndicatorComponent', () => {
  let component: ContentSaveStateIndicatorComponent;
  let fixture: ComponentFixture<ContentSaveStateIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentSaveStateIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSaveStateIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
