import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth'; 

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService); 

  joinForm = this.fb.nonNullable.group({
    roomId: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit() {
    if (this.authService.currentUser()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  onJoin() {
    if (this.joinForm.valid) {
      this.router.navigate(['/join', this.joinForm.getRawValue().roomId]);
    }
  }
}