import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class UiService {
  constructor(private toasts: ToastController, private alerts: AlertController) {}

  async toast(message: string, color: 'success' | 'danger' | 'medium' = 'success') {
    const t = await this.toasts.create({ message, duration: 2200, color, position: 'top' });
    await t.present();
  }
  error(e: any) { return this.toast(e?.message || String(e), 'danger'); }

  async confirm(header: string, message: string, okText = 'Confirm'): Promise<boolean> {
    return new Promise(async resolve => {
      const a = await this.alerts.create({
        header, message,
        buttons: [{ text: 'Cancel', role: 'cancel', handler: () => resolve(false) }, { text: okText, handler: () => resolve(true) }]
      });
      a.onDidDismiss().then(() => resolve(false));
      await a.present();
    });
  }
  async info(header: string, message: string) {
    const a = await this.alerts.create({ header, message, buttons: ['OK'] });
    await a.present();
  }
}
