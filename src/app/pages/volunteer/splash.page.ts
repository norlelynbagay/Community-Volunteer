import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-splash', standalone: true, imports: [IonContent, IonSpinner, LogoComponent],
  template: `
  <ion-content class="auth-bg">
    <div class="auth-wrap">
      <app-logo [size]="110"></app-logo>
      <h1 class="brand-title">Community<br>Volunteer</h1>
      <p class="muted"><i>Make a Difference Together</i></p>
      <div style="margin-top:40px"><ion-spinner name="crescent" color="primary"></ion-spinner><p class="small">Loading...</p></div>
    </div>
  </ion-content>`
})
export class SplashPage implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}
  async ngOnInit() {
    await Promise.all([this.auth.ready, new Promise(r => setTimeout(r, 1500))]);
    const target = !this.auth.session() ? '/login' : this.auth.isAdmin ? '/admin/dashboard' : '/app/home';
    this.router.navigateByUrl(target, { replaceUrl: true });
  }
}
