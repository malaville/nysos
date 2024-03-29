import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BibliographyLinkComponent } from './bibliography-link.component';

describe('BibliographyLinkComponent', () => {
  let component: BibliographyLinkComponent;
  let fixture: ComponentFixture<BibliographyLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BibliographyLinkComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BibliographyLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
