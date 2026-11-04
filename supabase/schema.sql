-- =====================================================================
-- Community Volunteer - Supabase setup
-- Run this whole file in: Supabase Dashboard -> SQL Editor -> New query
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Tables ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  num         bigint generated always as identity,
  full_name   text not null default '',
  email       text not null default '',
  location    text,
  status      text not null default 'Active'    check (status in ('Active','Inactive')),
  role        text not null default 'volunteer' check (role in ('admin','volunteer')),
  created_at  timestamptz not null default now()
);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  num         bigint generated always as identity,
  title       text not null,
  description text,
  event_date  timestamptz not null,
  location    text not null default '',
  image_url   text,
  status      text not null default 'Upcoming' check (status in ('Upcoming','Ongoing','Completed','Cancelled')),
  hours       int  not null default 4,
  created_at  timestamptz not null default now()
);

create table if not exists public.registrations (
  id          uuid primary key default gen_random_uuid(),
  num         bigint generated always as identity,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event_id    uuid not null references public.events(id)   on delete cascade,
  status      text not null default 'Pending' check (status in ('Pending','Approved','Rejected')),
  message     text,
  admin_note  text,
  created_at  timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.settings (
  id            int primary key default 1 check (id = 1),
  org_name      text not null default 'Community Volunteer',
  contact_email text not null default 'info@communityvolunteer.org',
  location      text not null default 'Brgy. Poblacion, City'
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ---------- Helpers ----------
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Create a profile automatically for every new auth user
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, location)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.email, ''), new.raw_user_meta_data->>'location');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only admins can change role/status of a profile (SQL editor / service role are allowed)
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'Not allowed to change role or status';
  end if;
  return new;
end $$;

drop trigger if exists protect_profile_trg on public.profiles;
create trigger protect_profile_trg before update on public.profiles
  for each row execute function public.protect_profile();

-- Admin-only: remove a volunteer completely (auth account + profile + registrations)
create or replace function public.delete_volunteer(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  delete from auth.users where id = uid and id <> auth.uid();
end $$;

-- ---------- Row Level Security ----------
alter table public.profiles      enable row level security;
alter table public.events        enable row level security;
alter table public.registrations enable row level security;
alter table public.settings      enable row level security;

drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles update" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "events read"  on public.events;
drop policy if exists "events admin" on public.events;
create policy "events read"  on public.events for select to authenticated using (true);
create policy "events admin" on public.events for all    to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reg read"   on public.registrations;
drop policy if exists "reg insert" on public.registrations;
drop policy if exists "reg update" on public.registrations;
drop policy if exists "reg delete" on public.registrations;
create policy "reg read"   on public.registrations for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "reg insert" on public.registrations for insert to authenticated with check (user_id = auth.uid() and status = 'Pending');
create policy "reg update" on public.registrations for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "reg delete" on public.registrations for delete to authenticated using ((user_id = auth.uid() and status = 'Pending') or public.is_admin());

drop policy if exists "settings read"  on public.settings;
drop policy if exists "settings admin" on public.settings;
create policy "settings read"  on public.settings for select to authenticated using (true);
create policy "settings admin" on public.settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant execute on function public.delete_volunteer(uuid) to authenticated;

-- =====================================================================
-- STEP 2 (run AFTER creating the admin user in Authentication -> Users):
--   email:    admin@communityvolunteer.org
--   password: admin123          (tick "Auto Confirm User")
-- Then run this line to make that user the admin:
-- =====================================================================
-- update public.profiles set role = 'admin', full_name = 'Admin' where email = 'admin@communityvolunteer.org';
