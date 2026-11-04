import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-line-chart', standalone: true,
  template: `
  <svg class="chart" viewBox="0 0 400 190">
    @for (g of grid; track g.v) {
      <line x1="34" x2="392" [attr.y1]="g.y" [attr.y2]="g.y" stroke="#e5ece7" />
      <text x="28" [attr.y]="g.y + 3" text-anchor="end" font-size="10" fill="#7a8a80">{{ g.v }}</text>
    }
    <path [attr.d]="area" fill="rgba(31,160,79,.16)" />
    <polyline [attr.points]="line" fill="none" stroke="#1fa04f" stroke-width="2.5" stroke-linejoin="round" />
    @for (p of pts; track $index) {
      <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3.5" fill="#fff" stroke="#1fa04f" stroke-width="2" />
      <text [attr.x]="p.x" y="184" text-anchor="middle" font-size="10" fill="#7a8a80">{{ labels[$index] }}</text>
    }
  </svg>`
})
export class LineChartComponent {
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  private readonly L = 40; private readonly R = 388; private readonly T = 12; private readonly B = 164;
  get max() { const m = Math.max(1, ...this.values); return Math.ceil(m / 4) * 4 || 4; }
  get grid() { return [0, 1, 2, 3, 4].map(i => ({ v: Math.round((this.max / 4) * i), y: this.B - ((this.B - this.T) / 4) * i })); }
  get pts() {
    const n = this.values.length; const step = n > 1 ? (this.R - this.L) / (n - 1) : 0;
    return this.values.map((v, i) => ({ x: this.L + step * i, y: this.B - (v / this.max) * (this.B - this.T) }));
  }
  get line() { return this.pts.map(p => `${p.x},${p.y}`).join(' '); }
  get area() {
    const p = this.pts; if (!p.length) return '';
    return `M${p[0].x},${this.B} ` + p.map(q => `L${q.x},${q.y}`).join(' ') + ` L${p[p.length - 1].x},${this.B} Z`;
  }
}

@Component({
  selector: 'app-donut', standalone: true,
  template: `
  <svg viewBox="0 0 120 120" width="150" height="150">
    <circle cx="60" cy="60" r="40" fill="none" stroke="#eef3ef" stroke-width="16" />
    @for (a of arcs; track a.label) {
      <circle cx="60" cy="60" r="40" fill="none" [attr.stroke]="a.color" stroke-width="16"
        [attr.stroke-dasharray]="a.len + ' ' + (C - a.len)" [attr.stroke-dashoffset]="-a.offset" transform="rotate(-90 60 60)" />
    }
    <text x="60" y="66" text-anchor="middle" font-size="18" font-weight="800" fill="#14281c">{{ center }}</text>
  </svg>`
})
export class DonutComponent {
  @Input() segments: { label: string; value: number; color: string }[] = [];
  readonly C = 2 * Math.PI * 40;
  get total() { return this.segments.reduce((s, x) => s + x.value, 0); }
  get center() { const c = this.segments[0]; return this.total && c ? Math.round((c.value / this.total) * 100) + '%' : '0%'; }
  get arcs() {
    let offset = 0;
    return this.segments.map(s => { const len = this.total ? (s.value / this.total) * this.C : 0; const a = { ...s, len, offset }; offset += len; return a; });
  }
}
