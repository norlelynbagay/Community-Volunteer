import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent,IonList,IonHeader, IonToolbar, IonButton, IonIcon} from '@ionic/angular/standalone';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-HelpSupport', standalone: true, imports: [IonHeader, IonToolbar, IonButton, IonContent, FormsModule, IonList,IonIcon,IonButton],
  templateUrl: './help-support.page.html',
  styleUrls: ['./help-support.page.scss']
})
export class HelpSupportPage {
  constructor(private data: DataService, private ui: UiService,private router: Router) {}

  goBack(){
    this.router.navigateByUrl('/app/profile');
  }
}