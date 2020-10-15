import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BibliographyDetailsComponent } from './bibliography-details.component';

describe('BibliographyDetailsComponent', () => {
  let component: BibliographyDetailsComponent;
  let fixture: ComponentFixture<BibliographyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BibliographyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BibliographyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
