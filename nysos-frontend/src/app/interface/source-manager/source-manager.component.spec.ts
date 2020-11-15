import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SourceManagerComponent } from './source-manager.component';

describe('SourceManagerComponent', () => {
  let component: SourceManagerComponent;
  let fixture: ComponentFixture<SourceManagerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
