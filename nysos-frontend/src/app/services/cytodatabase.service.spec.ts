import { TestBed } from '@angular/core/testing';

import { CytodatabaseService } from './cytodatabase.service';

describe('CytodatabaseService', () => {
  let service: CytodatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CytodatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
