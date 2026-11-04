import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';
import { UiService } from '../../core/ui.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-register', standalone: true, imports: [IonContent, IonIcon, IonSpinner, FormsModule, RouterLink, LogoComponent],
  template: `
  <ion-content class="auth-bg">
    <div class="auth-wrap">
      <app-logo [size]="70"></app-logo>
      <h1 class="brand-title">Community<br>Volunteer</h1>
      <div><h3>Create Account</h3><p class="muted small">Join our community of volunteers</p></div>
      <label class="field"><ion-icon name="person-outline"></ion-icon><input [(ngModel)]="name" placeholder="Full Name" autocomplete="name" /></label>
      <label class="field"><ion-icon name="mail-outline"></ion-icon><input type="email" [(ngModel)]="email" placeholder="Email Address" autocomplete="email" /></label>
      <label class="field"><ion-icon name="lock-closed-outline"></ion-icon>
        <input [type]="show ? 'text' : 'password'" [(ngModel)]="password" placeholder="Password (min. 6 characters)" autocomplete="new-password" />
        <ion-icon [name]="show ? 'eye-off-outline' : 'eye-outline'" (click)="show = !show"></ion-icon></label>
      <label class="field"><ion-icon name="lock-closed-outline"></ion-icon>
        <input [type]="show ? 'text' : 'password'" [(ngModel)]="confirm" placeholder="Confirm Password" autocomplete="new-password" (keyup.enter)="submit()" /></label>
      @if (error) { <p class="error">{{ error }}</p> }
      <button class="btn" [disabled]="busy" (click)="submit()">@if (busy) { <ion-spinner name="dots"></ion-spinner> } @else { Sign Up }</button>
      <p class="muted small">Already have an account? <a routerLink="/login">Login</a></p>
    </div>
  </ion-content>`
})
export class RegisterPage {
  name = ''; email = ''; password = ''; confirm = ''; show = false; busy = false; error = '';
  constructor(private auth: AuthService, private router: Router, private ui: UiService) {}
  async submit() {
    this.error = '';
    if (!this.name.trim() || !this.email.includes('@')) { this.error = 'Enter your full name and a valid email.'; return; }
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    if (this.password !== this.confirm) { this.error = 'Passwords do not match.'; return; }
    this.busy = true;
    try {
      const loggedIn = await this.auth.signUp(this.name, this.email, this.password);
      if (loggedIn) await this.router.navigateByUrl('/app/home', { replaceUrl: true });
      else { await this.ui.info('Check your email', 'We sent a confirmation link. Confirm your email, then log in.'); await this.router.navigateByUrl('/login'); }
    } catch (e: any) { this.error = e.message || 'Sign up failed.'; }
    finally { this.busy = false; }
  }
}
