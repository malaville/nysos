import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandingFabButtonComponent } from './expanding-fab-button.component';

describe('ExpandingFabButtonComponent', () => {
  let component: ExpandingFabButtonComponent;
  let fixture: ComponentFixture<ExpandingFabButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpandingFabButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandingFabButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
