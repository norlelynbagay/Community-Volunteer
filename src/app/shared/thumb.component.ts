import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-thumb', standalone: true, imports: [IonIcon],
  template: `@if (url) { <img [src]="url" alt="" /> } @else { <div class="ph"><ion-icon name="leaf-outline"></ion-icon></div> }`,
  styles: [`:host{display:block;overflow:hidden;background:linear-gradient(135deg,#2fae5f,#0a5a2b)}
    img{width:100%;height:100%;object-fit:cover;display:block}
    .ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:30px}`]
})
export class ThumbComponent { @Input() url: string | null | undefined; }
