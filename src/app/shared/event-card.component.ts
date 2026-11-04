import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { EventItem, Registration } from '../core/models';
import { ThumbComponent } from './thumb.component';

@Component({
  selector: 'app-event-card', standalone: true, imports: [IonIcon, DatePipe, ThumbComponent],
  template: `
  <div class="ecard" (click)="select.emit()">
    <app-thumb class="ecard-img" [url]="event.image_url"></app-thumb>
    <div class="ecard-body">
      <h4>{{ event.title }}</h4>
      <p><ion-icon name="calendar-outline"></ion-icon> {{ event.event_date | date:'MMM d, y' }}</p>
      <p><ion-icon name="location-outline"></ion-icon> {{ event.location }}</p>
    </div>
    <span class="join" [class.reg]="!!reg">{{ reg ? reg.status : 'Join' }}</span>
  </div>`
})
export class EventCardComponent {
  @Input({ required: true }) event!: EventItem;
  @Input() reg: Registration | undefined;
  @Output() select = new EventEmitter<void>();
}
