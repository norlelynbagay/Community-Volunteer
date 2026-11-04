import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { Registration } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { initials } from '../../core/util';
import { LineChartComponent } from '../../shared/charts.component';
import { AdminToolbarComponent } from './admin-toolbar.component';

@Component({
  selector: 'app-dashboard', standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, RouterLink, DatePipe, AdminToolbarComponent, LineChartComponent],
  template: `
  <app-admin-toolbar></app-admin-toolbar>
  <ion-content>
    <div class="page">
      <div class="banner"><h1>Dashboard</h1><p>Welcome back, Admin! Together for a better community.</p></div>
      @if (!s) { <div class="empty"><ion-spinner name="dots"></ion-spinner></div> } @else {
        <div class="stats">
          <div class="stat"><ion-icon name="people-circle-outline" style="color:#1fa04f"></ion-icon><div class="lbl">Total Volunteers</div><div class="num">{{ s.totalVolunteers }}</div></div>
          <div class="stat"><ion-icon name="calendar-outline" style="color:#3b82f6"></ion-icon><div class="lbl">Total Events</div><div class="num">{{ s.totalEvents }}</div></div>
          <div class="stat"><ion-icon name="hourglass-outline" style="color:#f5821f"></ion-icon><div class="lbl">Pending Requests</div><div class="num">{{ s.pending }}</div></div>
          <div class="stat"><ion-icon name="checkmark-done-outline" style="color:#8b5cf6"></ion-icon><div class="lbl">Approved</div><div class="num">{{ s.approved }}</div></div>
        </div>
        <div class="grid-2">
          <div class="panel"><h3>Volunteer Activity <span class="muted small">(registrations per month)</span></h3><app-line-chart [labels]="s.labels" [values]="s.activity"></app-line-chart></div>
          <div class="panel">
            <div class="sec-head" style="margin-top:0"><h3 style="margin:0">Recent Requests</h3><a routerLink="/admin/requests">See All</a></div>
            @if (!recent.length) { <p class="muted small">No requests yet.</p> }
            @for (r of recent; track r.id) {
              <div class="list-row" style="cursor:pointer" [routerLink]="['/admin/requests', r.id]">
                <div class="mini-avatar">{{ ini(r.profiles?.full_name) }}</div>
                <div class="grow"><b>{{ r.profiles?.full_name }}</b><small>{{ r.events?.title }} · {{ r.created_at | date:'MMM d' }}</small></div>
                <span [class]="'badge b-' + r.status.toLowerCase()">{{ r.status }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  </ion-content>`
})
export class DashboardPage {
  s: any; recent: Registration[] = []; ini = initials;
  constructor(private data: DataService, private ui: UiService) {}
  async ionViewWillEnter() {
    try {
      const [s, reqs] = await Promise.all([this.data.stats(), this.data.requests()]);
      this.s = s; this.recent = reqs.slice(0, 4);
    } catch (e) { this.ui.error(e); }
  }
}
