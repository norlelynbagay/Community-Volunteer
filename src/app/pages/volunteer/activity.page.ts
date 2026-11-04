import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { Registration } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { ThumbComponent } from '../../shared/thumb.component';

@Component({
  selector: 'app-activity', standalone: true, imports: [IonContent, IonSpinner, DatePipe, ThumbComponent],
  template: `
  <ion-content>
    <div class="sub-head" style="justify-content:center">My Activities</div>
    <div class="seg">
      <button [class.on]="tab === 'registered'" (click)="tab = 'registered'">Registered</button>
      <button [class.on]="tab === 'completed'" (click)="tab = 'completed'">Completed</button>
    </div>
    <div style="padding:0 16px 24px">
      @if (loading) { <div class="empty"><ion-spinner name="dots"></ion-spinner></div> }
      @else if (!shown.length) { <div class="empty">{{ tab === 'registered' ? 'You have no active registrations.' : 'No completed activities yet.' }}</div> }
      @for (r of shown; track r.id) {
        <div class="ecard" (click)="open(r)">
          <app-thumb class="ecard-img" [url]="r.events?.image_url"></app-thumb>
          <div class="ecard-body">
            <h4>{{ r.events?.title }}</h4>
            <p>{{ r.events?.event_date | date:'MMM d, y' }} · {{ r.events?.location }}</p>
            <span class="badge" style="margin-top:6px" [class]="'badge b-' + r.status.toLowerCase()">{{ tab === 'completed' ? 'Completed · ' + r.events?.hours + ' hrs' : r.status }}</span>
          </div>
        </div>
      }
    </div>
  </ion-content>`
})
export class ActivityPage {
  regs: Registration[] = []; tab: 'registered' | 'completed' = 'registered'; loading = true;
  constructor(private data: DataService, private router: Router, private ui: UiService) {}
  get shown() {
    const done = (r: Registration) => r.status === 'Approved' && r.events?.status === 'Completed';
    return this.regs.filter(r => (this.tab === 'completed' ? done(r) : !done(r)));
  }
  async ionViewWillEnter() {
    try { this.regs = await this.data.myRegistrations(); } catch (e) { this.ui.error(e); } finally { this.loading = false; }
  }
  open(r: Registration) { this.router.navigate(['/event', r.event_id]); }
}
