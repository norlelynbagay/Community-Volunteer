import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, home, calendarOutline, calendar, checkmarkCircleOutline, checkmarkCircle, personOutline, person,
  notificationsOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, searchOutline, locationOutline,
  chevronForwardOutline, arrowBack, settingsOutline, informationCircleOutline, helpCircleOutline, logOutOutline,
  peopleOutline, documentTextOutline, barChartOutline, addOutline, createOutline, trashOutline, checkmark, close,
  timeOutline, leafOutline, heart, peopleCircleOutline, hourglassOutline, checkmarkDoneOutline, trendingUpOutline,
  speedometerOutline, shieldCheckmarkOutline, personCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root', standalone: true, imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet></ion-router-outlet></ion-app>`
})
export class AppComponent {
  constructor() {
    addIcons({
      homeOutline, home, calendarOutline, calendar, checkmarkCircleOutline, checkmarkCircle, personOutline, person,
      notificationsOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, searchOutline, locationOutline,
      chevronForwardOutline, arrowBack, settingsOutline, informationCircleOutline, helpCircleOutline, logOutOutline,
      peopleOutline, documentTextOutline, barChartOutline, addOutline, createOutline, trashOutline, checkmark, close,
      timeOutline, leafOutline, heart, peopleCircleOutline, hourglassOutline, checkmarkDoneOutline, trendingUpOutline,
      speedometerOutline, shieldCheckmarkOutline, personCircleOutline
    });
  }
}
