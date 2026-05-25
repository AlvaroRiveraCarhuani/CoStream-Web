import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth-interceptor';
import { describe, it, expect } from 'vitest';

describe('authInterceptor', () => {
  it('debería estar definida la función del interceptor', () => {
    expect(authInterceptor).toBeTruthy();
  });
});