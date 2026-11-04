import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { OrgSettings } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { AdminToolbarComponent } from './admin-toolbar.component';

@Component({
  selector: 'app-settings', standalone: true, imports: [IonContent, IonSpinner, FormsModule, AdminToolbarComponent],
  template: `
  <app-admin-toolbar></app-admin-toolbar>
  <ion-content>
    <div class="page">
      <div class="page-head"><h1>Settings</h1></div>
      <div class="panel" style="max-width:620px">
        <div class="pill-tabs"><button [class.on]="tab === 'general'" (click)="tab = 'general'">General</button><button [class.on]="tab === 'security'" (click)="tab = 'security'">Security</button></div>
        @if (tab === 'general') {
          @if (!s) { <div class="empty"><ion-spinner name="dots"></ion-spinner></div> } @else {
            <div class="form-grid">
              <label>Organization Name</label><input [(ngModel)]="s.org_name" />
              <label>Contact Email</label><input type="email" [(ngModel)]="s.contact_email" />
              <label>Location</label><input [(ngModel)]="s.location" />
              <div class="modal-actions" style="justify-content:flex-start"><button class="btn sm" (click)="save()">Save Changes</button></div>
            </div>
          }
        } @else {
          <div class="form-grid">
            <label>New password (min. 6 characters)</label><input type="password" [(ngModel)]="pw" autocomplete="new-password" />
            <label>Confirm new password</label><input type="password" [(ngModel)]="pw2" autocomplete="new-password" />
            <div class="modal-actions" style="justify-content:flex-start"><button class="btn sm" (click)="changePw()">Update password</button></div>
          </div>
        }
      </div>
    </div>
  </ion-content>`
})
export class SettingsPage {
  tab: 'general' | 'security' = 'general'; s?: OrgSettings; pw = ''; pw2 = '';
  constructor(private data: DataService, private auth: AuthService, private ui: UiService) {}
  async ionViewWillEnter() { try { this.s = await this.data.settings(); } catch (e) { this.ui.error(e); } }
  async save() { try { await this.data.saveSettings(this.s!); this.ui.toast('Settings saved.'); } catch (e) { this.ui.error(e); } }
  async changePw() {
    if (this.pw.length < 6) { this.ui.toast('Password must be at least 6 characters.', 'danger'); return; }
    if (this.pw !== this.pw2) { this.ui.toast('Passwords do not match.', 'danger'); return; }
    try { await this.auth.updatePassword(this.pw); this.pw = this.pw2 = ''; this.ui.toast('Password updated.'); } catch (e) { this.ui.error(e); }
  }
}
