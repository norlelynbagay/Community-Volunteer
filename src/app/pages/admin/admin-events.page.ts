import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { EventItem } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { code, toLocalInput } from '../../core/util';
import { AdminToolbarComponent } from './admin-toolbar.component';

@Component({
  selector: 'app-admin-events', standalone: true, imports: [IonContent, IonIcon, FormsModule, DatePipe, AdminToolbarComponent],
  template: `
  <app-admin-toolbar></app-admin-toolbar>
  <ion-content>
    <div class="page">
      <div class="page-head"><h1>Manage Events</h1><button class="btn sm" (click)="openForm()"><ion-icon name="add-outline"></ion-icon> Add Event</button></div>
      <div class="panel">
        <label class="field search"><ion-icon name="search-outline"></ion-icon><input [(ngModel)]="q" (ngModelChange)="page = 1" placeholder="Search events..." /></label>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>ID</th><th>Event Title</th><th>Date</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            @for (e of paged; track e.id) {
              <tr><td>{{ code('EVT', e.num) }}</td><td>{{ e.title }}</td><td>{{ e.event_date | date:'MMM d, y' }}</td><td>{{ e.location }}</td>
                <td><span [class]="'badge b-' + e.status.toLowerCase()">{{ e.status }}</span></td>
                <td><button class="icon-btn" (click)="openForm(e)"><ion-icon name="create-outline"></ion-icon></button>
                  <button class="icon-btn red" (click)="remove(e)"><ion-icon name="trash-outline"></ion-icon></button></td></tr>
            } @empty { <tr><td colspan="6" class="center muted">No events yet. Click “Add Event” to create one.</td></tr> }
          </tbody></table></div>
        <div class="pager"><span>Showing {{ from }}–{{ to }} of {{ filtered.length }} events</span>
          <div><button (click)="go(page - 1)">‹</button>
            @for (p of pageNums; track p) { <button [class.on]="p === page" (click)="go(p)">{{ p }}</button> }
            <button (click)="go(page + 1)">›</button></div></div>
      </div>
    </div>

    @if (form) {
      <div class="modal-backdrop" (click)="form = null">
        <div class="modal form-grid" (click)="$event.stopPropagation()">
          <h3>{{ form.id ? 'Edit event' : 'Add event' }}</h3>
          <label>Title</label><input [(ngModel)]="form.title" />
          <label>Description</label><textarea rows="3" [(ngModel)]="form.description"></textarea>
          <label>Date & time</label><input type="datetime-local" [(ngModel)]="form.local" />
          <label>Location</label><input [(ngModel)]="form.location" placeholder="e.g. Brgy. Mabini" />
          <label>Volunteer hours</label><input type="number" min="1" [(ngModel)]="form.hours" />
          <label>Status</label><select [(ngModel)]="form.status"><option>Upcoming</option><option>Ongoing</option><option>Completed</option><option>Cancelled</option></select>
          <label>Image URL (optional)</label><input [(ngModel)]="form.image_url" placeholder="https://..." />
          <div class="modal-actions"><button class="btn ghost sm" (click)="form = null">Cancel</button><button class="btn sm" [disabled]="busy" (click)="save()">Save changes</button></div>
        </div>
      </div>
    }
  </ion-content>`
})
export class AdminEventsPage {
  list: EventItem[] = []; q = ''; page = 1; size = 8; form: any = null; busy = false; code = code;
  constructor(private data: DataService, private ui: UiService) {}
  get filtered() { const s = this.q.trim().toLowerCase(); return this.list.filter(e => !s || (e.title + e.location).toLowerCase().includes(s)); }
  get pages() { return Math.max(1, Math.ceil(this.filtered.length / this.size)); }
  get pageNums() { return Array.from({ length: this.pages }, (_, i) => i + 1).slice(Math.max(0, this.page - 3), this.page + 2); }
  get paged() { return this.filtered.slice((this.page - 1) * this.size, this.page * this.size); }
  get from() { return this.filtered.length ? (this.page - 1) * this.size + 1 : 0; }
  get to() { return Math.min(this.page * this.size, this.filtered.length); }
  go(p: number) { this.page = Math.min(Math.max(1, p), this.pages); }
  async ionViewWillEnter() { await this.load(); }
  async load() { try { this.list = await this.data.events(); } catch (e) { this.ui.error(e); } }
  openForm(e?: EventItem) {
    this.form = e ? { ...e, local: toLocalInput(e.event_date) }
      : { title: '', description: '', local: toLocalInput(new Date(Date.now() + 7 * 864e5).toISOString()), location: '', hours: 4, status: 'Upcoming', image_url: '' };
  }
  async save() {
    const f = this.form;
    if (!f.title?.trim() || !f.location?.trim() || !f.local) { this.ui.toast('Title, date and location are required.', 'danger'); return; }
    this.busy = true;
    try {
      await this.data.saveEvent({
        id: f.id, title: f.title.trim(), description: f.description?.trim() || null, event_date: new Date(f.local).toISOString(),
        location: f.location.trim(), hours: Number(f.hours) || 1, status: f.status, image_url: f.image_url?.trim() || null
      });
      this.form = null; this.ui.toast('Event saved.'); await this.load();
    } catch (e) { this.ui.error(e); } finally { this.busy = false; }
  }
  async remove(e: EventItem) {
    if (!(await this.ui.confirm('Delete event', `Delete “${e.title}” and all its registrations?`, 'Delete'))) return;
    try { await this.data.deleteEvent(e.id); this.ui.toast('Event deleted.', 'medium'); await this.load(); } catch (err) { this.ui.error(err); }
  }
}
