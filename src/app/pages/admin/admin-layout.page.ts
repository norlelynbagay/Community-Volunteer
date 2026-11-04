import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonContent, IonIcon, IonMenu, IonRouterOutlet, IonSplitPane, MenuController } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-admin-layout', standalone: true,
  imports: [IonSplitPane, IonMenu, IonContent, IonRouterOutlet, IonIcon, RouterLink, RouterLinkActive, LogoComponent],
  template: `
  <ion-split-pane contentId="admin-main" when="lg">
    <ion-menu menuId="admin" contentId="admin-main" class="admin-menu">
      <ion-content>
        <div class="brand"><app-logo [size]="44"></app-logo><span>Community<br>Volunteer</span></div>
        @for (i of items; track i.url) {
          <a [routerLink]="i.url" routerLinkActive="active" (click)="close()"><ion-icon [name]="i.icon"></ion-icon>{{ i.label }}</a>
        }
        <a (click)="logout()"><ion-icon name="log-out-outline"></ion-icon>Logout</a>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="admin-main"></ion-router-outlet>
  </ion-split-pane>`
})
export class AdminLayoutPage {
  items = [
    { url: '/admin/dashboard', label: 'Dashboard', icon: 'speedometer-outline' },
    { url: '/admin/volunteers', label: 'Volunteers', icon: 'people-outline' },
    { url: '/admin/requests', label: 'Requests', icon: 'document-text-outline' },
    { url: '/admin/events', label: 'Events', icon: 'calendar-outline' },
    { url: '/admin/reports', label: 'Reports', icon: 'bar-chart-outline' },
    { url: '/admin/settings', label: 'Settings', icon: 'settings-outline' }
  ];
  constructor(private auth: AuthService, private router: Router, private menu: MenuController) {}
  close() { this.menu.close('admin'); }
  async logout() { await this.auth.signOut(); this.router.navigateByUrl('/admin/login', { replaceUrl: true }); }
}
