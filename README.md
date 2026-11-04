# Community Volunteer (Ionic + Angular standalone + Supabase)

Volunteer mobile app + admin dashboard in one Ionic Angular project (standalone components, no NgModules).
Auth = Supabase Auth. Data = Supabase Postgres (with Row Level Security).

## 1. Install
```bash
npm install
```

## 2. Supabase setup
1. Create a project at https://supabase.com
2. **SQL Editor** -> paste and run `supabase/schema.sql`
3. **Authentication -> Providers -> Email**: turn **off** "Confirm email" (so sign-ups and admin-added volunteers can log in right away)
4. **Authentication -> Users -> Add user**
   - Email: `admin@communityvolunteer.org`
   - Password: `admin123`
   - Tick **Auto Confirm User**
5. **SQL Editor** -> run the last line of `schema.sql` (the commented `update public.profiles set role = 'admin' ...`) to make that user an admin
6. **Project Settings -> API** -> copy the Project URL and the `anon` public key into `src/environments/environment.ts`

## 3. Run
```bash
npm start          # or: ionic serve
```

## Logging in as admin
Supabase Auth works with emails, so the username **admin** is mapped to `admin@communityvolunteer.org`
(domain set in `environment.adminEmailDomain`).

- Username: `admin`
- Password: `admin123`

You can use it on `/admin/login` or on the normal login page - admins are sent to `/admin/dashboard`, volunteers to `/app/home`.
Change this password from **Admin -> Settings -> Security** before going live.

## What's included
**Volunteer app** - splash, login, sign up, home, events list + search, event details + register, my activities (registered / completed), profile (edit, about, help, log out).
**Admin** - dashboard, manage volunteers (add / view / edit / delete), requests (approve / reject / notes), manage events (add / edit / delete), reports (charts), settings (organization + change password).

## Build for mobile
```bash
npm run build && npx cap add android && npx cap sync && npx cap open android
```
