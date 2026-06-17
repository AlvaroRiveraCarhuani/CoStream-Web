import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth'; 

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService); 

  ngOnInit() {
    if (this.authService.currentUser()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }
}