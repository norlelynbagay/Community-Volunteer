import { Injectable, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Profile } from './models';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  session = signal<Session | null>(null);
  profile = signal<Profile | null>(null);
  ready: Promise<void>;

  constructor(private sb: SupabaseService) {
    this.ready = this.init();
    this.sb.client.auth.onAuthStateChange((event, session) => {
      this.session.set(session);
      if (event === 'SIGNED_OUT') this.profile.set(null);
    });
  }

  private async init() {
    const { data } = await this.sb.client.auth.getSession();
    this.session.set(data.session);
    if (data.session) await this.loadProfile(data.session.user.id);
  }

  get isAdmin() { return this.profile()?.role === 'admin'; }

  /** "admin" -> admin@communityvolunteer.org ; real emails are used as-is */
  toEmail(identifier: string) {
    const v = identifier.trim().toLowerCase();
    return v.includes('@') ? v : `${v}@${environment.adminEmailDomain}`;
  }

  async loadProfile(uid?: string): Promise<Profile | null> {
    const id = uid || this.session()?.user.id;
    if (!id) return null;
    const { data } = await this.sb.client.from('profiles').select('*').eq('id', id).maybeSingle();
    this.profile.set(data as Profile | null);
    return data as Profile | null;
  }

  async signIn(identifier: string, password: string): Promise<Profile> {
    const { data, error } = await this.sb.client.auth.signInWithPassword({ email: this.toEmail(identifier), password });
    if (error) throw error;
    this.session.set(data.session);
    const p = await this.loadProfile(data.user.id);
    if (!p) { await this.signOut(); throw new Error('Profile not found. Make sure supabase/schema.sql was run.'); }
    if (p.status === 'Inactive') { await this.signOut(); throw new Error('Your account is inactive. Please contact the admin.'); }
    return p;
  }

  /** returns true when logged in right away, false when email confirmation is required */
  async signUp(fullName: string, email: string, password: string): Promise<boolean> {
    const { data, error } = await this.sb.client.auth.signUp({
      email: email.trim().toLowerCase(), password, options: { data: { full_name: fullName.trim() } }
    });
    if (error) throw error;
    if (!data.session) return false;
    this.session.set(data.session);
    await this.loadProfile(data.user!.id);
    return true;
  }

  async signOut() {
    await this.sb.client.auth.signOut();
    this.session.set(null); this.profile.set(null);
  }

  async updateProfile(patch: Partial<Profile>) {
    const id = this.profile()!.id;
    const { data, error } = await this.sb.client.from('profiles').update(patch).eq('id', id).select().single();
    if (error) throw error;
    this.profile.set(data as Profile);
  }

  async updatePassword(password: string) {
    const { error } = await this.sb.client.auth.updateUser({ password });
    if (error) throw error;
  }
}
