import { TestBed } from '@angular/core/testing';

import { ScopeService } from './scope.service';

describe('RouterListeScopeServicenerService', () => {
  let service: ScopeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScopeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
