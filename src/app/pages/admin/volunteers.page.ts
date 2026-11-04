import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { Profile } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { code } from '../../core/util';
import { AdminToolbarComponent } from './admin-toolbar.component';

@Component({
  selector: 'app-volunteers', standalone: true, imports: [IonContent, IonIcon, FormsModule, AdminToolbarComponent],
  template: `
  <app-admin-toolbar></app-admin-toolbar>
  <ion-content>
    <div class="page">
      <div class="page-head"><h1>Manage Volunteers</h1><button class="btn sm" (click)="openAdd()"><ion-icon name="add-outline"></ion-icon> Add Volunteer</button></div>
      <div class="panel">
        <label class="field search"><ion-icon name="search-outline"></ion-icon><input [(ngModel)]="q" (ngModelChange)="page = 1" placeholder="Search volunteers..." /></label>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            @for (v of paged; track v.id) {
              <tr><td>{{ code('V', v.num) }}</td><td>{{ v.full_name }}</td><td>{{ v.email }}</td><td>{{ v.location || '—' }}</td>
                <td><span [class]="'badge b-' + v.status.toLowerCase()">{{ v.status }}</span></td>
                <td><button class="icon-btn green" (click)="view(v)"><ion-icon name="eye-outline"></ion-icon></button>
                  <button class="icon-btn" (click)="openEdit(v)"><ion-icon name="create-outline"></ion-icon></button>
                  <button class="icon-btn red" (click)="remove(v)"><ion-icon name="trash-outline"></ion-icon></button></td></tr>
            } @empty { <tr><td colspan="6" class="center muted">No volunteers found.</td></tr> }
          </tbody></table></div>
        <div class="pager"><span>Showing {{ from }}–{{ to }} of {{ filtered.length }} volunteers</span>
          <div><button (click)="go(page - 1)">‹</button>
            @for (p of pageNums; track p) { <button [class.on]="p === page" (click)="go(p)">{{ p }}</button> }
            <button (click)="go(page + 1)">›</button></div></div>
      </div>
    </div>

    @if (modal) {
      <div class="modal-backdrop" (click)="modal = null">
        <div class="modal form-grid" (click)="$event.stopPropagation()">
          @if (modal === 'view') {
            <h3>Volunteer details</h3>
            <div class="kv"><b>ID</b>{{ code('V', form.num) }}</div><div class="kv"><b>Name</b>{{ form.full_name }}</div>
            <div class="kv"><b>Email</b>{{ form.email }}</div><div class="kv"><b>Location</b>{{ form.location || '—' }}</div>
            <div class="kv"><b>Status</b>{{ form.status }}</div>
            <div class="modal-actions"><button class="btn sm" (click)="modal = null">Close</button></div>
          } @else {
            <h3>{{ modal === 'add' ? 'Add volunteer' : 'Edit volunteer' }}</h3>
            <label>Full name</label><input [(ngModel)]="form.full_name" />
            @if (modal === 'add') {
              <label>Email</label><input type="email" [(ngModel)]="form.email" />
              <label>Temporary password (min. 6 characters)</label><input type="text" [(ngModel)]="form.password" />
            } @else { <label>Email</label><input [value]="form.email" disabled /> }
            <label>Location</label><input [(ngModel)]="form.location" />
            @if (modal === 'edit') { <label>Status</label><select [(ngModel)]="form.status"><option>Active</option><option>Inactive</option></select> }
            <div class="modal-actions"><button class="btn ghost sm" (click)="modal = null">Cancel</button>
              <button class="btn sm" [disabled]="busy" (click)="save()">Save changes</button></div>
          }
        </div>
      </div>
    }
  </ion-content>`
})
export class VolunteersPage {
  list: Profile[] = []; q = ''; page = 1; size = 8; modal: 'add' | 'edit' | 'view' | null = null; form: any = {}; busy = false; code = code;
  constructor(private data: DataService, private ui: UiService) {}
  get filtered() { const s = this.q.trim().toLowerCase(); return this.list.filter(v => !s || (v.full_name + v.email + (v.location || '')).toLowerCase().includes(s)); }
  get pages() { return Math.max(1, Math.ceil(this.filtered.length / this.size)); }
  get pageNums() { return Array.from({ length: this.pages }, (_, i) => i + 1).slice(Math.max(0, this.page - 3), this.page + 2); }
  get paged() { return this.filtered.slice((this.page - 1) * this.size, this.page * this.size); }
  get from() { return this.filtered.length ? (this.page - 1) * this.size + 1 : 0; }
  get to() { return Math.min(this.page * this.size, this.filtered.length); }
  go(p: number) { this.page = Math.min(Math.max(1, p), this.pages); }
  async ionViewWillEnter() { await this.load(); }
  async load() { try { this.list = await this.data.volunteers(); } catch (e) { this.ui.error(e); } }
  view(v: Profile) { this.form = { ...v }; this.modal = 'view'; }
  openAdd() { this.form = { full_name: '', email: '', password: '', location: '' }; this.modal = 'add'; }
  openEdit(v: Profile) { this.form = { ...v }; this.modal = 'edit'; }
  async save() {
    if (!this.form.full_name?.trim()) { this.ui.toast('Name is required.', 'danger'); return; }
    this.busy = true;
    try {
      if (this.modal === 'add') {
        if (!this.form.email?.includes('@') || (this.form.password || '').length < 6) { this.ui.toast('Enter a valid email and a password of at least 6 characters.', 'danger'); return; }
        await this.data.createVolunteer(this.form);
        this.ui.toast('Volunteer added. Check Supabase email confirmation settings if they cannot log in.');
      } else { await this.data.saveVolunteer(this.form); this.ui.toast('Volunteer updated.'); }
      this.modal = null; await this.load();
    } catch (e) { this.ui.error(e); } finally { this.busy = false; }
  }
  async remove(v: Profile) {
    if (!(await this.ui.confirm('Delete volunteer', `Delete ${v.full_name}? Their account and registrations will be removed.`, 'Delete'))) return;
    try { await this.data.deleteVolunteer(v.id); this.ui.toast('Volunteer deleted.', 'medium'); await this.load(); } catch (e) { this.ui.error(e); }
  }
}
