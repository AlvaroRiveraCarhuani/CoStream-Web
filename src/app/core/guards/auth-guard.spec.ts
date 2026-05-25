import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth-guard';
import { describe, it, expect } from 'vitest';

describe('authGuard', () => {
  it('debería estar definida la función del guard de protección', () => {
    expect(authGuard).toBeTruthy();
  });
});