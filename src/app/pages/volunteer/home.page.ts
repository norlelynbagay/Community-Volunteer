import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { EventItem, Registration } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { EventCardComponent } from '../../shared/event-card.component';

@Component({
  selector: 'app-home', standalone: true, imports: [IonContent, IonIcon, IonSpinner, RouterLink, EventCardComponent],
  template: `
  <ion-content>
    <div class="v-header">
      <div><h2>Hello, {{ firstName }}!</h2><p>Together, we can<br>build a better community.</p></div>
      <ion-icon name="notifications-outline" style="font-size:24px"></ion-icon>
    </div>
    <div class="v-body">
      <div class="hero">Volunteer Today<br>Make an Impact!</div>
      <div class="tiles">
        <div class="tile" routerLink="/app/events"><ion-icon name="calendar-outline"></ion-icon>All Events</div>
        <div class="tile" routerLink="/app/activity"><ion-icon name="checkmark-circle-outline"></ion-icon>My Activity</div>
        <div class="tile" routerLink="/app/profile"><ion-icon name="person-outline"></ion-icon>Profile</div>
      </div>
      <div class="sec-head"><span>Upcoming Opportunities</span><a routerLink="/app/events">See All</a></div>
      @if (loading) { <div class="empty"><ion-spinner name="dots"></ion-spinner></div> }
      @else if (!events.length) { <div class="empty">No upcoming events yet. Check back soon!</div> }
      @for (e of events; track e.id) { <app-event-card [event]="e" [reg]="regs.get(e.id)" (select)="open(e)"></app-event-card> }
    </div>
  </ion-content>`
})
export class HomePage {
  events: EventItem[] = []; regs = new Map<string, Registration>(); loading = true;
  constructor(private auth: AuthService, private data: DataService, private router: Router, private ui: UiService) {}
  get firstName() { return (this.auth.profile()?.full_name || 'Volunteer').split(' ')[0]; }
  async ionViewWillEnter() {
    try {
      const [ev, regs] = await Promise.all([this.data.upcomingEvents(3), this.data.myRegistrations()]);
      this.events = ev; this.regs = new Map(regs.map(r => [r.event_id, r]));
    } catch (e) { this.ui.error(e); } finally { this.loading = false; }
  }
  open(e: EventItem) { this.router.navigate(['/event', e.id]); }
}
