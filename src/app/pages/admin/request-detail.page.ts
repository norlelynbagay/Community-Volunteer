import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { Registration, ReqStatus } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { initials } from '../../core/util';
import { AdminToolbarComponent } from './admin-toolbar.component';

@Component({
  selector: 'app-request-detail', standalone: true, imports: [IonContent, IonIcon, IonSpinner, FormsModule, DatePipe, AdminToolbarComponent],
  template: `
  <app-admin-toolbar></app-admin-toolbar>
  <ion-content>
    <div class="page">
      <div class="page-head"><h1>Request Details</h1><button class="btn ghost sm" (click)="back()">Back to requests</button></div>
      @if (!r) { <div class="empty"><ion-spinner name="dots"></ion-spinner></div> } @else {
        <div class="grid-2">
          <div class="panel">
            <div class="list-row" style="border:0"><div class="mini-avatar" style="width:64px;height:64px;font-size:22px">{{ ini(r.profiles?.full_name) }}</div>
              <div class="grow"><h3 style="margin:0">{{ r.profiles?.full_name }}</h3><small>{{ r.profiles?.email }}</small>
                <span [class]="'badge b-' + r.status.toLowerCase()" style="margin-top:6px">{{ r.status }}</span></div></div>
            <div class="kv"><b>Event</b>{{ r.events?.title }}</div>
            <div class="kv"><b>Date</b>{{ r.events?.event_date | date:'MMM d, y • h:mm a' }}</div>
            <div class="kv"><b>Location</b>{{ r.events?.location }}</div>
            <div class="kv"><b>Requested</b>{{ r.created_at | date:'MMM d, y' }}</div>
            <div class="kv"><b>Message</b>{{ r.message || 'No message provided.' }}</div>
          </div>
          <div class="panel form-grid">
            <h3>Actions</h3>
            <button class="btn block" [disabled]="busy" (click)="decide('Approved')"><ion-icon name="checkmark"></ion-icon> Approve Request</button>
            <button class="btn danger block" style="margin-top:10px" [disabled]="busy" (click)="decide('Rejected')"><ion-icon name="close"></ion-icon> Reject Request</button>
            <label>Additional Note (Optional)</label>
            <textarea rows="4" [(ngModel)]="note" placeholder="Add a note... (visible to the volunteer)"></textarea>
          </div>
        </div>
      }
    </div>
  </ion-content>`
})
export class RequestDetailPage {
  r?: Registration; note = ''; busy = false; ini = initials;
  constructor(private route: ActivatedRoute, private data: DataService, private ui: UiService, private router: Router) {}
  async ionViewWillEnter() {
    try { this.r = await this.data.request(this.route.snapshot.paramMap.get('id')!); this.note = this.r.admin_note || ''; }
    catch (e) { this.ui.error(e); this.back(); }
  }
  back() { this.router.navigateByUrl('/admin/requests'); }
  async decide(status: ReqStatus) {
    this.busy = true;
    try { await this.data.setRequest(this.r!.id, status, this.note.trim() || null); this.ui.toast(`Request ${status.toLowerCase()}.`); this.back(); }
    catch (e) { this.ui.error(e); } finally { this.busy = false; }
  }
}
