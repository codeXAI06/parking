import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  showRegister = false;
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user']
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/parking-list']);
    }
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/parking-list']);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }

  register(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = null;
      
      const { username, email, password, role } = this.registerForm.value;
      this.authService.register(username, email, password, role).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/parking-list']);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  toggleForm(): void {
    this.showRegister = !this.showRegister;
    this.error = null;
  }
}
