import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButtons, IonHeader, IonIcon, IonMenuButton, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-toolbar', standalone: true, imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonIcon],
  template: `
  <ion-header class="ion-no-border">
    <ion-toolbar class="admin-bar">
      <ion-buttons slot="start"><ion-menu-button menu="admin"></ion-menu-button></ion-buttons>
      <div slot="end" class="who">
        <ion-icon name="notifications-outline" style="font-size:20px"></ion-icon>
        <span>{{ auth.profile()?.full_name || 'Admin' }}</span>
        <button (click)="logout()">Logout</button>
      </div>
    </ion-toolbar>
  </ion-header>`,
  styles: [':host{display:block}']
})
export class AdminToolbarComponent {
  constructor(public auth: AuthService, private router: Router) {}
  async logout() { await this.auth.signOut(); this.router.navigateByUrl('/admin/login', { replaceUrl: true }); }
}
