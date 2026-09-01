import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client,
  },
  {
    path: 'confirmados',
    renderMode: RenderMode.Client,
  },
  {
    path: 'entregas',
    renderMode: RenderMode.Client,
  },
  {
    path: 'beneficiarios',
    renderMode: RenderMode.Client,
  },
  {
    path: 'google-forms',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
