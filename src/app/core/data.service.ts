import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { EventItem, OrgSettings, Profile, Registration, ReqStatus } from './models';
import { SupabaseService } from './supabase.service';
import { lastMonths, monthKey } from './util';

const REG_SELECT = '*, profiles(full_name,email,location), events(title,event_date,location,image_url,status,hours)';

@Injectable({ providedIn: 'root' })
export class DataService {
  private db;
  constructor(sb: SupabaseService, private auth: AuthService) { this.db = sb.client; }

  private unwrap<T>(res: { data: any; error: any }): T {
    if (res.error) throw res.error;
    return res.data as T;
  }

  // ---------- Events ----------
  async events(): Promise<EventItem[]> {
    return this.unwrap(await this.db.from('events').select('*').order('event_date', { ascending: true }));
  }
  async upcomingEvents(limit?: number): Promise<EventItem[]> {
    let q: any = this.db.from('events').select('*').eq('status', 'Upcoming').order('event_date', { ascending: true });
    if (limit) q = q.limit(limit);
    return this.unwrap(await q);
  }
  async event(id: string): Promise<EventItem> {
    return this.unwrap(await this.db.from('events').select('*').eq('id', id).single());
  }
  async saveEvent(ev: Partial<EventItem>) {
    const { id, num, created_at, ...rest } = ev as any;
    if (id) this.unwrap(await this.db.from('events').update(rest).eq('id', id));
    else this.unwrap(await this.db.from('events').insert(rest));
  }
  async deleteEvent(id: string) { this.unwrap(await this.db.from('events').delete().eq('id', id)); }

  // ---------- Volunteers ----------
  async volunteers(): Promise<Profile[]> {
    return this.unwrap(await this.db.from('profiles').select('*').eq('role', 'volunteer').order('num'));
  }
  async saveVolunteer(p: Partial<Profile>) {
    this.unwrap(await this.db.from('profiles').update({ full_name: p.full_name, location: p.location, status: p.status }).eq('id', p.id!));
  }
  async deleteVolunteer(id: string) { this.unwrap(await this.db.rpc('delete_volunteer', { uid: id })); }
  /** Creates a volunteer account without touching the admin's own session. */
  async createVolunteer(v: { full_name: string; email: string; password: string; location?: string }) {
    const tmp = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'cv-temp-client' }
    });
    const { error } = await tmp.auth.signUp({
      email: v.email.trim().toLowerCase(), password: v.password,
      options: { data: { full_name: v.full_name.trim(), location: v.location?.trim() || null } }
    });
    if (error) throw error;
  }

  // ---------- Registrations / requests ----------
  async requests(status?: ReqStatus): Promise<Registration[]> {
    let q: any = this.db.from('registrations').select(REG_SELECT).order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    return this.unwrap(await q);
  }
  async request(id: string): Promise<Registration> {
    return this.unwrap(await this.db.from('registrations').select(REG_SELECT).eq('id', id).single());
  }
  async setRequest(id: string, status: ReqStatus, note?: string | null) {
    const patch: any = { status };
    if (note !== undefined) patch.admin_note = note;
    this.unwrap(await this.db.from('registrations').update(patch).eq('id', id));
  }
  async myRegistrations(): Promise<Registration[]> {
    const uid = this.auth.session()!.user.id;
    return this.unwrap(await this.db.from('registrations').select(REG_SELECT).eq('user_id', uid).order('created_at', { ascending: false }));
  }
  async register(eventId: string, message?: string) {
    const res = await this.db.from('registrations').insert({ user_id: this.auth.session()!.user.id, event_id: eventId, message: message || null });
    if (res.error) throw new Error(res.error.code === '23505' ? 'You already registered for this event.' : res.error.message);
  }
  async cancelRegistration(id: string) { this.unwrap(await this.db.from('registrations').delete().eq('id', id)); }

  // ---------- Reports ----------
  async stats() {
    const [vols, events, regs] = await Promise.all([
      this.db.from('profiles').select('created_at').eq('role', 'volunteer'),
      this.db.from('events').select('status'),
      this.db.from('registrations').select('status,created_at,events(status,hours)')
    ]);
    const v = this.unwrap<any[]>(vols), e = this.unwrap<any[]>(events), r = this.unwrap<any[]>(regs);
    const months = lastMonths(6);
    const count = (s: string) => r.filter(x => x.status === s).length;
    const approved = count('Approved'), rejected = count('Rejected');
    const eventCount = (s: string) => e.filter(x => x.status === s).length;
    return {
      totalVolunteers: v.length,
      totalEvents: e.length,
      pending: count('Pending'), approved, rejected,
      totalHours: r.filter(x => x.status === 'Approved' && x.events?.status === 'Completed').reduce((s, x) => s + (x.events?.hours || 0), 0),
      participationRate: approved + rejected ? Math.round((approved / (approved + rejected)) * 100) : 0,
      labels: months.map(m => m.label),
      growth: months.map(m => v.filter(p => new Date(p.created_at) < m.end).length),
      activity: months.map(m => r.filter(x => monthKey(x.created_at) === m.key).length),
      eventStatus: [
        { label: 'Completed', value: eventCount('Completed'), color: '#1fa04f' },
        { label: 'Ongoing', value: eventCount('Ongoing'), color: '#3b82f6' },
        { label: 'Upcoming', value: eventCount('Upcoming'), color: '#f5b73b' },
        { label: 'Cancelled', value: eventCount('Cancelled'), color: '#e55353' }
      ]
    };
  }

  // ---------- Settings ----------
  async settings(): Promise<OrgSettings> {
    return this.unwrap(await this.db.from('settings').select('*').eq('id', 1).single());
  }
  async saveSettings(s: Partial<OrgSettings>) {
    this.unwrap(await this.db.from('settings').update({ org_name: s.org_name, contact_email: s.contact_email, location: s.location }).eq('id', 1));
  }
}
