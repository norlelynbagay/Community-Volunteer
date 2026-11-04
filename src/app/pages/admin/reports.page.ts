import { Component } from '@angular/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { UiService } from '../../core/ui.service';
import { DonutComponent, LineChartComponent } from '../../shared/charts.component';
import { AdminToolbarComponent } from './admin-toolbar.component';

@Component({
  selector: 'app-reports', standalone: true, imports: [IonContent, IonIcon, IonSpinner, AdminToolbarComponent, LineChartComponent, DonutComponent],
  template: `
  <app-admin-toolbar></app-admin-toolbar>
  <ion-content>
    <div class="page">
      <div class="page-head"><h1>Reports</h1></div>
      @if (!s) { <div class="empty"><ion-spinner name="dots"></ion-spinner></div> } @else {
        <div class="stats">
          <div class="stat"><ion-icon name="people-circle-outline" style="color:#1fa04f"></ion-icon><div class="lbl">Total Volunteers</div><div class="num">{{ s.totalVolunteers }}</div></div>
          <div class="stat"><ion-icon name="calendar-outline" style="color:#3b82f6"></ion-icon><div class="lbl">Total Events</div><div class="num">{{ s.totalEvents }}</div></div>
          <div class="stat"><ion-icon name="time-outline" style="color:#f5821f"></ion-icon><div class="lbl">Total Hours</div><div class="num">{{ s.totalHours }}</div></div>
          <div class="stat"><ion-icon name="trending-up-outline" style="color:#8b5cf6"></ion-icon><div class="lbl">Participation Rate</div><div class="num">{{ s.participationRate }}%</div></div>
        </div>
        <div class="grid-2">
          <div class="panel"><h3>Volunteer Growth</h3><app-line-chart [labels]="s.labels" [values]="s.growth"></app-line-chart></div>
          <div class="panel"><h3>Event Participation</h3>
            <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><app-donut [segments]="s.eventStatus"></app-donut>
              <div class="legend">@for (x of s.eventStatus; track x.label) { <span><i [style.background]="x.color"></i>{{ x.label }} ({{ x.value }})</span> }</div></div></div>
        </div>
        <p class="muted small" style="margin-top:12px">Total hours = hours of completed events with approved volunteers. Participation rate = approved ÷ (approved + rejected) requests.</p>
      }
    </div>
  </ion-content>`
})
export class ReportsPage {
  s: any;
  constructor(private data: DataService, private ui: UiService) {}
  async ionViewWillEnter() { try { this.s = await this.data.stats(); } catch (e) { this.ui.error(e); } }
}
