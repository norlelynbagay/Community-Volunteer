export const code = (prefix: string, n: number, pad = 3) => prefix + String(n ?? 0).padStart(pad, '0');
export const initials = (name?: string) => (name || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
export function toLocalInput(iso: string): string {
  const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
export const monthKey = (iso: string) => { const x = new Date(iso); return `${x.getFullYear()}-${x.getMonth()}`; };
export function lastMonths(n: number) {
  const now = new Date(); const out: { key: string; label: string; end: Date }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${x.getFullYear()}-${x.getMonth()}`, label: x.toLocaleString('en', { month: 'short' }),
      end: new Date(x.getFullYear(), x.getMonth() + 1, 1) });
  }
  return out;
}
