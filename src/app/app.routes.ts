import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'confirmados'
  },
  {
    path: 'confirmados',
    loadComponent: () => import('./pages/confirmados/confirmados').then(m => m.Confirmados)
  },
  {
    path: 'entregas',
    loadComponent: () => import('./pages/entregas/entregas').then(m => m.Entregas)
  },
  {
    path: 'beneficiarios',
    loadComponent: () => import('./pages/beneficiarios/beneficiarios').then(m => m.Beneficiarios)
  },
  {
    path: 'google-forms',
    loadComponent: () => import('./pages/google-forms/google-forms').then(m => m.GoogleForms)
  },
  {
    path: '**',
    redirectTo: 'confirmados'
  }
];
