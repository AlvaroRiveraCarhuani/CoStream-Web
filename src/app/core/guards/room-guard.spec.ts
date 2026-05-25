import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { roomGuard } from './room-guard';

describe('roomGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roomGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
