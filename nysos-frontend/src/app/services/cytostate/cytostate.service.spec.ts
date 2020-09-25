import { TestBed } from '@angular/core/testing';

import { CytostateService } from './cytostate.service';

describe('CytostateService', () => {
  let service: CytostateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CytostateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
