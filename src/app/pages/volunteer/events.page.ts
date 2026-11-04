import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DataService } from '../../core/data.service';
import { EventItem, Registration } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { EventCardComponent } from '../../shared/event-card.component';

@Component({
  selector: 'app-events', standalone: true, imports: [IonContent, IonIcon, IonSpinner, FormsModule, EventCardComponent],
  template: `
  <ion-content>
    <div class="sub-head">Volunteer Opportunities</div>
    <div style="padding:12px 16px 24px">
      <label class="field" style="margin-bottom:14px"><ion-icon name="search-outline"></ion-icon>
        <input [(ngModel)]="q" placeholder="Search events..." /></label>
      @if (loading) { <div class="empty"><ion-spinner name="dots"></ion-spinner></div> }
      @else if (!filtered.length) { <div class="empty">No events found.</div> }
      @for (e of filtered; track e.id) { <app-event-card [event]="e" [reg]="regs.get(e.id)" (select)="open(e)"></app-event-card> }
    </div>
  </ion-content>`
})
export class EventsPage {
  events: EventItem[] = []; regs = new Map<string, Registration>(); loading = true; q = '';
  constructor(private data: DataService, private router: Router, private ui: UiService) {}
  get filtered() {
    const s = this.q.trim().toLowerCase();
    return this.events.filter(e => !s || e.title.toLowerCase().includes(s) || e.location.toLowerCase().includes(s));
  }
  async ionViewWillEnter() {
    try {
      const [ev, regs] = await Promise.all([this.data.upcomingEvents(), this.data.myRegistrations()]);
      this.events = ev; this.regs = new Map(regs.map(r => [r.event_id, r]));
    } catch (e) { this.ui.error(e); } finally { this.loading = false; }
  }
  open(e: EventItem) { this.router.navigate(['/event', e.id]); }
}
