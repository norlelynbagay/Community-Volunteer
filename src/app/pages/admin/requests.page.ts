import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { Registration, ReqStatus } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { code } from '../../core/util';
import { AdminToolbarComponent } from './admin-toolbar.component';

@Component({
  selector: 'app-requests', standalone: true, imports: [IonContent, IonIcon, FormsModule, DatePipe, AdminToolbarComponent],
  template: `
  <app-admin-toolbar></app-admin-toolbar>
  <ion-content>
    <div class="page">
      <div class="page-head"><h1>Volunteer Requests</h1></div>
      <div class="panel">
        <div class="pill-tabs">
          @for (t of tabs; track t) { <button [class.on]="tab === t" (click)="tab = t; page = 1">{{ t }} ({{ count(t) }})</button> }
        </div>
        <label class="field search"><ion-icon name="search-outline"></ion-icon><input [(ngModel)]="q" (ngModelChange)="page = 1" placeholder="Search name, email or event..." /></label>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Event/Activity</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            @for (r of paged; track r.id) {
              <tr class="click" (click)="open(r)"><td>{{ code('R', r.num) }}</td><td>{{ r.profiles?.full_name }}</td><td>{{ r.profiles?.email }}</td>
                <td>{{ r.events?.title }}</td><td>{{ r.events?.event_date | date:'MMM d, y' }}</td>
                <td (click)="$event.stopPropagation()">
                  @if (r.status === 'Pending') {
                    <button class="sq ok" title="Approve" (click)="decide(r, 'Approved')"><ion-icon name="checkmark"></ion-icon></button>
                    <button class="sq no" title="Reject" (click)="decide(r, 'Rejected')"><ion-icon name="close"></ion-icon></button>
                  } @else { <span [class]="'badge b-' + r.status.toLowerCase()">{{ r.status }}</span> }
                </td></tr>
            } @empty { <tr><td colspan="6" class="center muted">No {{ tab.toLowerCase() }} requests.</td></tr> }
          </tbody></table></div>
        <div class="pager"><span>Showing {{ from }}–{{ to }} of {{ filtered.length }} requests</span>
          <div><button (click)="go(page - 1)">‹</button>
            @for (p of pageNums; track p) { <button [class.on]="p === page" (click)="go(p)">{{ p }}</button> }
            <button (click)="go(page + 1)">›</button></div></div>
      </div>
    </div>
  </ion-content>`
})
export class RequestsPage {
  all: Registration[] = []; tabs: ReqStatus[] = ['Pending', 'Approved', 'Rejected']; tab: ReqStatus = 'Pending'; q = ''; page = 1; size = 8; code = code;
  constructor(private data: DataService, private ui: UiService, private router: Router) {}
  count(t: ReqStatus) { return this.all.filter(r => r.status === t).length; }
  get filtered() {
    const s = this.q.trim().toLowerCase();
    return this.all.filter(r => r.status === this.tab && (!s || ((r.profiles?.full_name || '') + (r.profiles?.email || '') + (r.events?.title || '')).toLowerCase().includes(s)));
  }
  get pages() { return Math.max(1, Math.ceil(this.filtered.length / this.size)); }
  get pageNums() { return Array.from({ length: this.pages }, (_, i) => i + 1).slice(Math.max(0, this.page - 3), this.page + 2); }
  get paged() { return this.filtered.slice((this.page - 1) * this.size, this.page * this.size); }
  get from() { return this.filtered.length ? (this.page - 1) * this.size + 1 : 0; }
  get to() { return Math.min(this.page * this.size, this.filtered.length); }
  go(p: number) { this.page = Math.min(Math.max(1, p), this.pages); }
  async ionViewWillEnter() { await this.load(); }
  async load() { try { this.all = await this.data.requests(); } catch (e) { this.ui.error(e); } }
  open(r: Registration) { this.router.navigate(['/admin/requests', r.id]); }
  async decide(r: Registration, status: ReqStatus) {
    try { await this.data.setRequest(r.id, status); this.ui.toast(`Request ${status.toLowerCase()}.`); await this.load(); } catch (e) { this.ui.error(e); }
  }
}
