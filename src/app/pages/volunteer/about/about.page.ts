import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent,IonList,IonHeader, IonToolbar, IonButton, IonIcon} from '@ionic/angular/standalone';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-About', standalone: true, imports: [IonHeader, IonToolbar, IonButton, IonContent, FormsModule, IonList,IonIcon,IonButton],
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss']
})
export class AboutPage {
  constructor(private data: DataService, private ui: UiService,private router: Router) {}

  goBack(){
    this.router.navigateByUrl('/app/profile');
  }
}