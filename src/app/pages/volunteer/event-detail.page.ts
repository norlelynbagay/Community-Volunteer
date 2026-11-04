import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { EventItem, Registration } from '../../core/models';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-event-detail', standalone: true, imports: [IonContent, IonIcon, IonSpinner, FormsModule, DatePipe],
  template: `
  <ion-content>
    @if (event) {
      <div class="detail-hero" [style.background-image]="event.image_url ? 'url(' + event.image_url + ')' : 'linear-gradient(135deg,#2fae5f,#0a5a2b)'">
        <ion-icon name="arrow-back" (click)="back()" style="color:#fff;font-size:26px;margin:18px;filter:drop-shadow(0 1px 3px #0008)"></ion-icon>
      </div>
      <div class="detail-body">
        <h2>{{ event.title }}</h2>
        <div class="detail-row"><ion-icon name="calendar-outline"></ion-icon>{{ event.event_date | date:'MMM d, y • h:mm a' }}</div>
        <div class="detail-row"><ion-icon name="location-outline"></ion-icon>{{ event.location }}</div>
        <div class="detail-row"><ion-icon name="time-outline"></ion-icon>{{ event.hours }} volunteer hours</div>
        <h4 style="margin:18px 0 6px">About this event</h4>
        <p class="muted">{{ event.description || 'No description provided.' }}</p>

        @if (reg) {
          <div class="panel" style="margin-top:20px;background:var(--cv-mint)">
            <p>Your registration is <span class="badge" [class]="'badge b-' + reg.status.toLowerCase()">{{ reg.status }}</span></p>
            @if (reg.admin_note) { <p class="small muted" style="margin-top:6px">Note from admin: {{ reg.admin_note }}</p> }
            @if (reg.status === 'Pending') { <button class="btn ghost sm" style="margin-top:10px" (click)="cancel()">Cancel registration</button> }
          </div>
        } @else if (event.status === 'Upcoming') {
          <label class="field" style="margin-top:20px;height:auto;padding:10px 12px">
            <input [(ngModel)]="message" placeholder="Add a message (optional)" /></label>
          <button class="btn block" style="margin-top:12px" [disabled]="busy" (click)="register()">
            @if (busy) { <ion-spinner name="dots"></ion-spinner> } @else { Register Now }</button>
        } @else {
          <p class="muted" style="margin-top:20px">Registration is closed for this event ({{ event.status }}).</p>
        }
      </div>
    } @else { <div class="empty"><ion-spinner name="dots"></ion-spinner></div> }
  </ion-content>`
})
export class EventDetailPage {
  event?: EventItem; reg?: Registration; message = ''; busy = false;
  constructor(private route: ActivatedRoute, private data: DataService, private router: Router, private ui: UiService) {}
  async ionViewWillEnter() { await this.load(); }
  async load() {
    try {
      const id = this.route.snapshot.paramMap.get('id')!;
      const [ev, regs] = await Promise.all([this.data.event(id), this.data.myRegistrations()]);
      this.event = ev; this.reg = regs.find(r => r.event_id === id);
    } catch (e) { this.ui.error(e); this.back(); }
  }
  back() { this.router.navigateByUrl('/app/events'); }
  async register() {
    this.busy = true;
    try { await this.data.register(this.event!.id, this.message.trim()); this.ui.toast('Registration sent! Waiting for admin approval.'); await this.load(); }
    catch (e) { this.ui.error(e); } finally { this.busy = false; }
  }
  async cancel() {
    if (!(await this.ui.confirm('Cancel registration', 'Do you want to cancel your registration?', 'Yes, cancel'))) return;
    try { await this.data.cancelRegistration(this.reg!.id); this.ui.toast('Registration cancelled.', 'medium'); await this.load(); }
    catch (e) { this.ui.error(e); }
  }
}
