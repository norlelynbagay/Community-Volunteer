import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { UiService } from '../../core/ui.service';
import { initials } from '../../core/util';

@Component({
  selector: 'app-profile', standalone: true, imports: [IonContent, IonIcon, FormsModule],
  template: `
  <ion-content>
    <div class="profile-top">
      <div class="avatar">{{ ini }}</div>
      <h2>{{ auth.profile()?.full_name }}</h2>
      <p style="opacity:.85;font-size:14px">{{ auth.profile()?.email }}</p>
    </div>
    <div class="menu-list">
      <div class="menu-item" (click)="go('/app/activity')"><ion-icon name="calendar-outline"></ion-icon>My Activities<ion-icon name="chevron-forward-outline"></ion-icon></div>
      <div class="menu-item" (click)="openEdit()"><ion-icon name="settings-outline"></ion-icon>Settings<ion-icon name="chevron-forward-outline"></ion-icon></div>
      <div class="menu-item" (click)="about()"><ion-icon name="information-circle-outline"></ion-icon>About Us<ion-icon name="chevron-forward-outline"></ion-icon></div>
      <div class="menu-item" (click)="help()"><ion-icon name="help-circle-outline"></ion-icon>Help & Support<ion-icon name="chevron-forward-outline"></ion-icon></div>
      <div class="menu-item red" (click)="logout()"><ion-icon name="log-out-outline"></ion-icon>Log Out<ion-icon name="chevron-forward-outline"></ion-icon></div>
    </div>

    @if (editing) {
      <div class="modal-backdrop" (click)="editing = false">
        <div class="modal form-grid" (click)="$event.stopPropagation()">
          <h3>Edit profile</h3>
          <label>Full name</label><input [(ngModel)]="form.full_name" />
          <label>Location</label><input [(ngModel)]="form.location" placeholder="e.g. Brgy. Mabini" />
          <div class="modal-actions"><button class="btn ghost sm" (click)="editing = false">Cancel</button><button class="btn sm" (click)="save()">Save changes</button></div>
        </div>
      </div>
    }
  </ion-content>`
})
export class ProfilePage {
  editing = false; form: any = {};
  constructor(public auth: AuthService, private data: DataService, private router: Router, private ui: UiService) {}
  get ini() { return initials(this.auth.profile()?.full_name); }
  go(url: string) { this.router.navigateByUrl(url); }
  openEdit() { const p = this.auth.profile()!; this.form = { full_name: p.full_name, location: p.location || '' }; this.editing = true; }
  async save() {
    if (!this.form.full_name?.trim()) { this.ui.toast('Name is required.', 'danger'); return; }
    try { await this.auth.updateProfile({ full_name: this.form.full_name.trim(), location: this.form.location?.trim() || null }); this.editing = false; this.ui.toast('Profile updated.'); }
    catch (e) { this.ui.error(e); }
  }
  async about() { const s = await this.data.settings().catch(() => null); this.ui.info('About Us', `${s?.org_name || 'Community Volunteer'} connects neighbors with volunteer opportunities so we can make a difference together.`); }
  async help() { const s = await this.data.settings().catch(() => null); this.ui.info('Help & Support', `Need help? Email us at ${s?.contact_email || 'info@communityvolunteer.org'}.`); }
  async logout() {
    if (!(await this.ui.confirm('Log out', 'Are you sure you want to log out?', 'Log out'))) return;
    await this.auth.signOut(); this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
