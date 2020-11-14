import { TestBed } from '@angular/core/testing';

import { RemoteDatabaseService } from './remote-database.service';

describe('RemoteDatabaseService', () => {
  let service: RemoteDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
