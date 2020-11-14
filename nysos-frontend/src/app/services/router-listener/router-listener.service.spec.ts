import { TestBed } from '@angular/core/testing';

import { RouterListenerService } from './router-listener.service';

describe('RouterListenerService', () => {
  let service: RouterListenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouterListenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
