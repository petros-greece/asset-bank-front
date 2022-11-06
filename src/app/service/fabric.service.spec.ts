import { TestBed } from '@angular/core/testing';

import { FabricService } from './fabric.service';

describe('FabricService', () => {
  let service: FabricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FabricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
