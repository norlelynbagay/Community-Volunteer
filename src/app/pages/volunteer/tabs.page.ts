import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs', standalone: true, imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
  <ion-tabs>
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="home"><ion-icon name="home-outline"></ion-icon><ion-label>Home</ion-label></ion-tab-button>
      <ion-tab-button tab="events"><ion-icon name="calendar-outline"></ion-icon><ion-label>Events</ion-label></ion-tab-button>
      <ion-tab-button tab="activity"><ion-icon name="checkmark-circle-outline"></ion-icon><ion-label>Activity</ion-label></ion-tab-button>
      <ion-tab-button tab="profile"><ion-icon name="person-outline"></ion-icon><ion-label>Profile</ion-label></ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>`
})
export class TabsPage {}
