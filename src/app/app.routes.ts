import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'splash' },
  { path: 'splash', loadComponent: () => import('./pages/volunteer/splash.page').then(m => m.SplashPage) },
  { path: 'login', loadComponent: () => import('./pages/volunteer/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/volunteer/register.page').then(m => m.RegisterPage) },
  {
    path: 'app', canActivate: [authGuard],
    loadComponent: () => import('./pages/volunteer/tabs.page').then(m => m.TabsPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', loadComponent: () => import('./pages/volunteer/home.page').then(m => m.HomePage) },
      { path: 'events', loadComponent: () => import('./pages/volunteer/events.page').then(m => m.EventsPage) },
      { path: 'activity', loadComponent: () => import('./pages/volunteer/activity.page').then(m => m.ActivityPage) },
      { path: 'profile', loadComponent: () => import('./pages/volunteer/profile.page').then(m => m.ProfilePage) },
      { path: 'about', loadComponent: () => import('./pages/volunteer/about/about.page').then(m => m.AboutPage) },
      { path: 'help-support', loadComponent: () => import('./pages/volunteer/help-support/help-support.page').then(m => m.HelpSupportPage) }
    ]
  },
  { path: 'event/:id', canActivate: [authGuard], loadComponent: () => import('./pages/volunteer/event-detail.page').then(m => m.EventDetailPage) },

  { path: 'admin/login', loadComponent: () => import('./pages/admin/admin-login.page').then(m => m.AdminLoginPage) },
  {
    path: 'admin', canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin-layout.page').then(m => m.AdminLayoutPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard.page').then(m => m.DashboardPage) },
      { path: 'volunteers', loadComponent: () => import('./pages/admin/volunteers.page').then(m => m.VolunteersPage) },
      { path: 'requests', loadComponent: () => import('./pages/admin/requests.page').then(m => m.RequestsPage) },
      { path: 'requests/:id', loadComponent: () => import('./pages/admin/request-detail.page').then(m => m.RequestDetailPage) },
      { path: 'events', loadComponent: () => import('./pages/admin/admin-events.page').then(m => m.AdminEventsPage) },
      { path: 'reports', loadComponent: () => import('./pages/admin/reports.page').then(m => m.ReportsPage) },
      { path: 'settings', loadComponent: () => import('./pages/admin/settings.page').then(m => m.SettingsPage) }
    ]
  },
  { path: '**', redirectTo: 'splash' }
];
