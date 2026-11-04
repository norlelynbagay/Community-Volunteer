import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-login', standalone: true, imports: [IonContent, IonIcon, IonSpinner, FormsModule, RouterLink, LogoComponent],
  template: `
  <ion-content class="auth-bg">
    <div class="auth-wrap">
      <app-logo [size]="80"></app-logo>
      <h1 class="brand-title">Community<br>Volunteer</h1>
      <div><h3>Welcome Back!</h3><p class="muted small">Login to continue</p></div>
      <label class="field"><ion-icon name="mail-outline"></ion-icon>
        <input [(ngModel)]="identifier" placeholder="Email or Username" autocomplete="username" (keyup.enter)="submit()" /></label>
      <label class="field"><ion-icon name="lock-closed-outline"></ion-icon>
        <input [type]="show ? 'text' : 'password'" [(ngModel)]="password" placeholder="Password" autocomplete="current-password" (keyup.enter)="submit()" />
        <ion-icon [name]="show ? 'eye-off-outline' : 'eye-outline'" (click)="show = !show"></ion-icon></label>
      @if (error) { <p class="error">{{ error }}</p> }
      <button class="btn" [disabled]="busy" (click)="submit()">@if (busy) { <ion-spinner name="dots"></ion-spinner> } @else { Login }</button>
      <p class="muted small">Don't have an account? <a routerLink="/register">Sign Up</a></p>
      <p class="small"><a routerLink="/admin/login">Admin panel</a></p>
    </div>
  </ion-content>`
})
export class LoginPage {
  identifier = ''; password = ''; show = false; busy = false; error = '';
  constructor(private auth: AuthService, private router: Router) {}
  async submit() {
    this.error = '';
    if (!this.identifier.trim() || !this.password) { this.error = 'Enter your email (or username) and password.'; return; }
    this.busy = true;
    try {
      const p = await this.auth.signIn(this.identifier, this.password);
      await this.router.navigateByUrl(p.role === 'admin' ? '/admin/dashboard' : '/app/home', { replaceUrl: true });
    } catch (e: any) { this.error = e.message || 'Login failed.'; }
    finally { this.busy = false; }
  }
}
