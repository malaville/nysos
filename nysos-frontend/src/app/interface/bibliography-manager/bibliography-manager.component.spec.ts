import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BibliographyManagerComponent } from './bibliography-manager.component';

describe('BibliographyManagerComponent', () => {
  let component: BibliographyManagerComponent;
  let fixture: ComponentFixture<BibliographyManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BibliographyManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BibliographyManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
