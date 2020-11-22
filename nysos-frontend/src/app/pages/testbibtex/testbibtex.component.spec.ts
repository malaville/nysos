import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestbibtexComponent } from './testbibtex.component';

describe('TestbibtexComponent', () => {
  let component: TestbibtexComponent;
  let fixture: ComponentFixture<TestbibtexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestbibtexComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestbibtexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
