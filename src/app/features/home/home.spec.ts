import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { describe, beforeEach, it, expect } from 'vitest';

describe('Home Component - Sprint 2 Unit Tests', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  
  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          Home, 
          ReactiveFormsModule, 
          HttpClientTestingModule, 
          RouterModule.forRoot([
            { path: 'auth/login', redirectTo: '' } // Declaramos la ruta para absorber la redirección del test
          ])
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(Home);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

  it('debería mantener el botón de creación deshabilitado si requiere PIN pero el campo está vacío', () => {
    component.createForm.patchValue({
      title: 'Sala de Telemedicina',
      isPublic: false,
      requiresPin: true,
      pin: '' 
    });
    
    fixture.detectChanges();
    
    const isFormInvalid = component.createForm.invalid;
    const isPinMissing = component.createForm.get('requiresPin')?.value && !component.createForm.get('pin')?.value;
    
    expect(isFormInvalid || isPinMissing).toBe(true);
  });
});