import { ChangeDetectionStrategy, Component, inject, signal, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CafeteriaService } from '../../services/cafeteria';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <!-- Mobile Backdrop -->
    @if (mobileOpen()) {
      <button 
        type="button"
        aria-label="Cerrar navegación lateral"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity border-0 p-0 w-full h-full cursor-pointer"
        (click)="closeMobile.emit()"
      ></button>
    }

    <!-- Sidebar Container -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out text-slate-300"
      [class.w-72]="!collapsed() || mobileOpen()"
      [class.w-20]="collapsed() && !mobileOpen()"
      [class.-translate-x-full]="!mobileOpen()"
      [class.translate-x-0]="mobileOpen()"
      [class.lg:translate-x-0]="true"
    >
      <!-- Brand Header -->
      <div class="h-18 flex items-center px-5 justify-between border-b border-slate-800">
        <div class="flex items-center gap-3 overflow-hidden">
          <!-- Logo Icon -->
          <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
            <span class="font-black">A</span>
          </div>
          
          <!-- Brand Info (Shown when expanded) -->
          @if (!collapsed() || mobileOpen()) {
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-white text-base tracking-tight truncate">AlimentaCheck</span>
              <span class="text-[11px] font-medium text-slate-400 truncate">Cafetería Guarincito</span>
            </div>
          }
        </div>

        <!-- Desktop Collapse Button -->
        <button 
          type="button"
          (click)="toggleCollapse()"
          class="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          [title]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
        >
          <mat-icon class="text-xl">{{ collapsed() ? 'last_page' : 'first_page' }}</mat-icon>
        </button>

        <!-- Mobile Close Button -->
        <button 
          type="button"
          (click)="closeMobile.emit()"
          class="flex lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
        @for (section of navSections; track section.title) {
          <div>
            @if (!collapsed() || mobileOpen()) {
              <div class="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {{ section.title }}
              </div>
            } @else {
              <div class="w-full h-px bg-slate-800 my-2"></div>
            }

            <nav class="space-y-1">
              @for (item of section.items; track item.route) {
                <a
                  [routerLink]="item.route"
                  (click)="onItemClick()"
                  routerLinkActive="active-nav-link"
                  class="group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 cursor-pointer"
                  [class.justify-center]="collapsed() && !mobileOpen()"
                >
                  <mat-icon class="text-lg shrink-0 transition-transform group-hover:scale-105">
                    {{ item.icon }}
                  </mat-icon>

                  @if (!collapsed() || mobileOpen()) {
                    <span class="truncate flex-1">{{ item.label }}</span>
                    @if (item.badge) {
                      <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 shrink-0">
                        {{ item.badge }}
                      </span>
                    }
                  }

                  <!-- Floating Tooltip when Collapsed -->
                  @if (collapsed() && !mobileOpen()) {
                    <div class="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-800">
                      {{ item.label }}
                    </div>
                  }
                </a>
              }
            </nav>
          </div>
        }
      </div>

      <!-- Footer / Live Sync Status Info -->
      <div class="p-4 border-t border-slate-800 bg-slate-950/40">
        <div class="flex items-center justify-between">
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-0.5">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="truncate">{{ cafeteria.isGoogleConnected() ? 'Sincronizado en Vivo' : 'Modo Local' }}</span>
            </div>
            @if (!collapsed() || mobileOpen()) {
              <div class="text-[10px] text-slate-500 truncate">
                {{ cafeteria.formularios()[0]?.ultimaSincronizacion ? 'Última sync: ' + cafeteria.formularios()[0].ultimaSincronizacion : 'Listo para sincronizar' }}
              </div>
            }
          </div>
          @if (!collapsed() || mobileOpen()) {
            <button
              type="button"
              (click)="resetDemo()"
              title="Restablecer Datos Demo"
              class="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <mat-icon class="text-sm">restart_alt</mat-icon>
            </button>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .active-nav-link {
      background-color: #1e293b !important; /* bg-slate-800 */
      color: #ffffff !important;
      font-weight: 600 !important;
      border-right: 4px solid #3b82f6 !important; /* border-blue-500 */
      border-radius: 0.5rem 0 0 0.5rem !important;
    }
    .active-nav-link mat-icon {
      color: #60a5fa !important; /* text-blue-400 */
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
  `]
})
export class Sidebar {
  readonly cafeteria = inject(CafeteriaService);

  collapsed = signal<boolean>(false);
  mobileOpen = input<boolean>(false);
  closeMobile = output<void>();

  readonly navSections: NavSection[] = [
    {
      title: 'Módulos del Sistema',
      items: [
        { label: 'Lista Confirmados', route: '/confirmados', icon: 'how_to_reg', badge: 'Principal' },
        { label: 'Raciones Entregadas', route: '/entregas', icon: 'task_alt', badge: 'En Vivo' },
        { label: 'Beneficiarios iVMS', route: '/beneficiarios', icon: 'badge' },
        { label: 'Google Forms & Sheets', route: '/google-forms', icon: 'sync' }
      ]
    }
  ];

  toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }

  onItemClick(): void {
    if (this.mobileOpen()) {
      this.closeMobile.emit();
    }
  }

  resetDemo(): void {
    if (confirm('¿Deseas limpiar todos los registros y dejar el sistema en blanco para cargar tus datos reales?')) {
      this.cafeteria.vaciarTodoElSistema();
    }
  }
}
