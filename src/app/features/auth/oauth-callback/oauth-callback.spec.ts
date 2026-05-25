import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OauthCallback } from './oauth-callback';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect } from 'vitest';

describe('OauthCallback Component', () => {
  let component: OauthCallback;
  let fixture: ComponentFixture<OauthCallback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OauthCallback, HttpClientTestingModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZjIwNjQ4Ni0xY2NiLTRkYzYtODJlNi0wMTBmNjZhYjUxZDciLCJlbWFpbCI6ImFkbWluQHVhYi5lZHUuYm8iLCJyb2xlIjoiSE9TVCIsImlhdCI6MTc4MTMxNzk4NSwiZXhwIjoxNzgxMzYxMTg1fQ.jVMoKiOtKkGGSlF1t-j7YKEkIvmROlMljfJOLkjhdvQ' }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OauthCallback);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente el interceptor de callback', () => {
    expect(component).toBeTruthy();
  });
});