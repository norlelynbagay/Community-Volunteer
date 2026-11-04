import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo', standalone: true,
  template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M10 48c0 24 18 40 40 40s40-16 40-40" fill="none" stroke="#1f9d4d" stroke-width="9" stroke-linecap="round"/>
    <circle cx="20" cy="28" r="11" fill="#1f9d4d"/><circle cx="80" cy="28" r="11" fill="#1f9d4d"/>
    <circle cx="50" cy="16" r="11" fill="#f5821f"/>
    <path d="M50 80C30 64 34 50 44 50c4 0 6 3 6 3s2-3 6-3c10 0 14 14-6 30z" fill="#0a5a2b"/>
  </svg>`,
  styles: [':host{display:inline-block;line-height:0}']
})
export class LogoComponent { @Input() size = 64; }
