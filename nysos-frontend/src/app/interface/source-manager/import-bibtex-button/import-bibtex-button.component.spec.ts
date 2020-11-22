import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportBibtexButtonComponent } from './import-bibtex-button.component';

describe('ImportBibtexButtonComponent', () => {
  let component: ImportBibtexButtonComponent;
  let fixture: ComponentFixture<ImportBibtexButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportBibtexButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportBibtexButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
