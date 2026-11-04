import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-admin-login', standalone: true, imports: [IonContent, IonIcon, IonSpinner, FormsModule, RouterLink, LogoComponent],
  template: `
  <ion-content class="auth-bg">
    <div class="auth-wrap">
      <app-logo [size]="90"></app-logo>
      <div><h1 class="brand-title">Community<br>Volunteer</h1><p class="muted" style="margin-top:6px">Admin Panel</p></div>
      <label class="field"><ion-icon name="person-outline"></ion-icon>
        <input [(ngModel)]="username" placeholder="Admin Username" autocomplete="username" (keyup.enter)="submit()" /></label>
      <label class="field"><ion-icon name="lock-closed-outline"></ion-icon>
        <input type="password" [(ngModel)]="password" placeholder="Password" autocomplete="current-password" (keyup.enter)="submit()" /></label>
      @if (error) { <p class="error">{{ error }}</p> }
      <button class="btn" [disabled]="busy" (click)="submit()">@if (busy) { <ion-spinner name="dots"></ion-spinner> } @else { Login }</button>
      <p class="small"><a routerLink="/login">Volunteer login</a></p>
      <p class="muted small">© 2026 Community Volunteer</p>
    </div>
  </ion-content>`
})
export class AdminLoginPage {
  username = ''; password = ''; busy = false; error = '';
  constructor(private auth: AuthService, private router: Router) {}
  async submit() {
    this.error = '';
    if (!this.username.trim() || !this.password) { this.error = 'Enter your username and password.'; return; }
    this.busy = true;
    try {
      const p = await this.auth.signIn(this.username, this.password);
      if (p.role !== 'admin') { await this.auth.signOut(); throw new Error('This account does not have admin access.'); }
      await this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
    } catch (e: any) { this.error = e.message || 'Login failed.'; }
    finally { this.busy = false; }
  }
}
