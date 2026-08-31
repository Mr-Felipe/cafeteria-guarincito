import { ChangeDetectionStrategy, Component, inject, signal, computed, output, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { CafeteriaService } from '../../services/cafeteria';

interface RouteInfo {
  title: string;
  subtitle: string;
  icon: string;
}

const ROUTE_INFO_MAP: Record<string, RouteInfo> = {
  '/confirmados': {
    title: 'Lista de Confirmados',
    subtitle: 'Panel Operativo Diario · Cafetería Guarincito',
    icon: 'how_to_reg'
  },
  '/entregas': {
    title: 'Raciones Entregadas con Hora',
    subtitle: 'Auditoría en tiempo real de raciones entregadas con hora exacta y filtros',
    icon: 'task_alt'
  },
  '/beneficiarios': {
    title: 'Gestión de Beneficiarios · iVMS-4200',
    subtitle: 'Padrón institucional de estudiantes con subsidio alimentario activo',
    icon: 'badge'
  },
  '/google-forms': {
    title: 'Sincronización con Google Forms & Sheets',
    subtitle: 'Conexión en tiempo real con libros de respuestas y formularios',
    icon: 'sync'
  }
};

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: {
    class: 'sticky top-0 z-40 block w-full'
  },
  template: `
    <header class="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      <!-- Left: Mobile Menu Toggle & Page Identity -->
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <!-- Hamburger (mobile only) -->
        <button
          type="button"
          (click)="toggleMobile.emit()"
          class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Abrir navegación"
        >
          <mat-icon class="text-2xl">menu</mat-icon>
        </button>

        <!-- Current View Icon -->
        <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
          <mat-icon class="text-lg">{{ currentInfo().icon }}</mat-icon>
        </div>

        <!-- Title & Subtitle -->
        <div class="flex flex-col min-w-0">
          <h1 class="text-base sm:text-lg font-semibold text-slate-800 tracking-tight truncate leading-tight">
            {{ currentInfo().title }}
          </h1>
          <p class="text-xs text-slate-500 truncate hidden sm:block">
            {{ currentInfo().subtitle }}
          </p>
        </div>
      </div>

      <!-- Right: Clock & System Status & Sync Button -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Live Date & Clock -->
        <div class="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full px-3.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
          <mat-icon class="text-slate-400 text-sm">schedule</mat-icon>
          <span>{{ currentDateFormatted() }} · {{ currentTime() }}</span>
        </div>

        <!-- Online Status Indicator -->
        <button
          type="button"
          (click)="cafeteria.toggleGoogleConnection()"
          [title]="cafeteria.isGoogleConnected() ? 'Sistema Online · Google Conectado' : 'Modo Offline Local'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
          [class.bg-emerald-50]="cafeteria.isGoogleConnected()"
          [class.text-emerald-700]="cafeteria.isGoogleConnected()"
          [class.border-emerald-200]="cafeteria.isGoogleConnected()"
          [class.bg-amber-50]="!cafeteria.isGoogleConnected()"
          [class.text-amber-700]="!cafeteria.isGoogleConnected()"
          [class.border-amber-200]="!cafeteria.isGoogleConnected()"
        >
          <span class="relative flex h-2 w-2">
            @if (cafeteria.isGoogleConnected()) {
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            } @else {
              <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            }
          </span>
          <span class="hidden md:inline">
            {{ cafeteria.isGoogleConnected() ? 'Google Conectado' : 'Modo Local' }}
          </span>
        </button>

        <!-- Global Quick Sync Button -->
        <button
          type="button"
          (click)="onSyncClick()"
          [disabled]="cafeteria.isSyncing()"
          title="Sincronizar hojas de Google Sheets"
          class="p-2 sm:px-3.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <mat-icon class="text-base" [class.animate-spin]="cafeteria.isSyncing()">sync</mat-icon>
          <span class="hidden sm:inline">Sincronizar</span>
        </button>

        <!-- User Avatar Badge -->
        <div class="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 shadow-2xs" title="Administrador de Cafetería">
          CG
        </div>
      </div>
    </header>
  `
})
export class Topbar implements OnInit, OnDestroy {
  readonly cafeteria = inject(CafeteriaService);
  private router = inject(Router);

  toggleMobile = output<void>();

  currentTime = signal<string>('');
  currentDateFormatted = signal<string>('');
  currentUrl = signal<string>('/confirmados');
  private timeInterval: ReturnType<typeof setInterval> | null = null;

  readonly currentInfo = computed<RouteInfo>(() => {
    const url = this.currentUrl();
    for (const [route, info] of Object.entries(ROUTE_INFO_MAP)) {
      if (url.startsWith(route)) {
        return info;
      }
    }
    return {
      title: 'Cafetería Guarincito',
      subtitle: 'Sistema de Control de Subsidiados',
      icon: 'restaurant'
    };
  });

  ngOnInit(): void {
    this.updateClock();
    this.timeInterval = setInterval(() => this.updateClock(), 1000);

    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    this.currentDateFormatted.set(now.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }));
  }

  onSyncClick(): void {
    this.cafeteria.sincronizarConGoogleSheets();
  }
}
