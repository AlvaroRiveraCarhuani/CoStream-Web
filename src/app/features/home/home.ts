import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth'; 
  
@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #0f172a; color: white;">
      <h2>Cargando tu espacio de trabajo...</h2>
    </div>
  `
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.authService.currentUser()) {
      return;
    }

    this.router.navigate(['/auth/login']);
  }
}