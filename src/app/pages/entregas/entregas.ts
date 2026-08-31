import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CafeteriaService } from '../../services/cafeteria';
import { SubsidioFiltro, CARRERAS_REGISTRADAS, getVisualCarrera, Confirmacion } from '../../models/cafeteria.models';

@Component({
  selector: 'app-entregas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            Auditoría en Tiempo Real · Cafetería Guarincito
          </span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Registro de Raciones Entregadas</h2>
          <p class="text-sm text-slate-600">
            Control cronológico y auditoría con hora exacta de entrega por estudiante y programa académico.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Sincronizar Google Sheets -->
          <button
            type="button"
            (click)="cafeteria.sincronizarConGoogleSheets()"
            [disabled]="cafeteria.isSyncing()"
            class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <mat-icon class="text-base" [class.animate-spin]="cafeteria.isSyncing()">sync</mat-icon>
            <span>{{ cafeteria.isSyncing() ? 'Sincronizando...' : 'Sincronizar' }}</span>
          </button>

          <!-- Exportar CSV -->
          <button
            type="button"
            (click)="cafeteria.exportarEntregadosCSV()"
            [disabled]="entregasFiltradas().length === 0"
            class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            title="Descargar lista de entregas con hora en formato Excel / CSV"
          >
            <mat-icon class="text-base text-emerald-600">download</mat-icon>
            <span>Exportar Reporte (CSV)</span>
          </button>

          <!-- Imprimir -->
          <button
            type="button"
            (click)="imprimirActa()"
            [disabled]="entregasFiltradas().length === 0"
            class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <mat-icon class="text-base">print</mat-icon>
            <span>Imprimir Reporte</span>
          </button>

          <!-- Ir a Confirmados -->
          <a
            routerLink="/confirmados"
            class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <mat-icon class="text-base">how_to_reg</mat-icon>
            <span>Ver Confirmados</span>
          </a>
        </div>
      </div>

      <!-- FEEDBACK NOTIFICATION -->
      @if (despachoMensaje()) {
        <div 
          class="p-4 rounded-xl border flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200"
          [class.bg-emerald-50]="despachoMensaje()?.success"
          [class.border-emerald-200]="despachoMensaje()?.success"
          [class.text-emerald-900]="despachoMensaje()?.success"
          [class.bg-amber-50]="!despachoMensaje()?.success"
          [class.border-amber-200]="!despachoMensaje()?.success"
          [class.text-amber-900]="!despachoMensaje()?.success"
        >
          <div class="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <mat-icon class="text-lg">
              {{ despachoMensaje()?.success ? 'check_circle' : 'warning' }}
            </mat-icon>
            <span>{{ despachoMensaje()?.message }}</span>
          </div>
          <button 
            type="button" 
            (click)="despachoMensaje.set(null)"
            class="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <mat-icon class="text-base">close</mat-icon>
          </button>
        </div>
      }

      <!-- STATS KPIS CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Entregadas -->
        <div class="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Raciones Entregadas</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <mat-icon class="text-base">task_alt</mat-icon>
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">{{ cafeteria.statsEntregas().totalEntregados }}</span>
            <span class="text-xs font-medium text-slate-500">
              de {{ cafeteria.statsEntregas().totalConfirmados }} confirmados ({{ cafeteria.statsEntregas().porcentaje }}%)
            </span>
          </div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              class="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              [style.width.%]="cafeteria.statsEntregas().porcentaje"
            ></div>
          </div>
        </div>

        <!-- 2. Almuerzos Entregados -->
        <div class="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Almuerzos (Diurno)</span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
              <mat-icon class="text-base">lunch_dining</mat-icon>
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">{{ cafeteria.statsEntregas().almuerzos }}</span>
            <span class="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
              11:30 AM - 2:30 PM
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-2">9 Programas académicos diurnos</p>
        </div>

        <!-- 3. Refrigerios Entregados -->
        <div class="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Refrigerios (Noche)</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
              <mat-icon class="text-base">nightlife</mat-icon>
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">{{ cafeteria.statsEntregas().refrigerios }}</span>
            <span class="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              5:30 PM - 8:00 PM
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-2">Admon Financiera y Trabajo Social</p>
        </div>

        <!-- 4. Rango de Horas Operativas -->
        <div class="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Horario de Entregas</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center">
              <mat-icon class="text-base">schedule</mat-icon>
            </div>
          </div>
          <div class="mt-2 space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium">Primera entrega:</span>
              <span class="font-semibold text-slate-800">{{ cafeteria.statsEntregas().primerEntrega || 'Sin registros' }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium">Última entrega:</span>
              <span class="font-semibold text-slate-800">{{ cafeteria.statsEntregas().ultimaEntrega || 'Sin registros' }}</span>
            </div>
          </div>
          <div class="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <mat-icon class="text-xs">bolt</mat-icon>
            <span>Registro en tiempo real</span>
          </div>
        </div>
      </div>

      <!-- BARRA DE DESPACHO RÁPIDO -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 text-white shadow-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <mat-icon class="text-xl">qr_code_scanner</mat-icon>
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-white leading-tight">Despacho Rápido en Ventanilla</h3>
              <p class="text-xs text-slate-300">Digita o escanea el Código ID del estudiante para marcar la entrega al instante.</p>
            </div>
          </div>

          <!-- Input form -->
          <form (submit)="onDespachoRapido($event)" class="flex items-center gap-2 w-full sm:w-auto">
            <div class="relative flex-1 sm:w-64">
              <input
                type="text"
                [formControl]="codigoInput"
                placeholder="Código ID (Ej: 202410...)"
                class="w-full bg-slate-950/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-400 text-sm rounded-lg px-3 py-2 pl-9 font-mono uppercase transition-all"
                autofocus
              />
              <mat-icon class="absolute left-2.5 top-2.5 text-slate-400 text-sm">badge</mat-icon>
            </div>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <mat-icon class="text-sm">done</mat-icon>
              <span>Despachar</span>
            </button>
          </form>
        </div>
      </div>

      <!-- FILTROS Y BÚSQUEDA -->
      <div class="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- 1. Búsqueda -->
          <div class="relative">
            <input
              type="text"
              [formControl]="busquedaControl"
              placeholder="Buscar por nombre, código o carrera..."
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 text-xs sm:text-sm rounded-lg px-3 py-2 pl-9 transition-colors"
            />
            <mat-icon class="absolute left-2.5 top-2.5 text-slate-400 text-sm">search</mat-icon>
            @if (busquedaControl.value) {
              <button 
                type="button"
                (click)="busquedaControl.setValue('')"
                class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <mat-icon class="text-sm">cancel</mat-icon>
              </button>
            }
          </div>

          <!-- 2. Filtro Subsidio -->
          <div>
            <select
              [formControl]="subsidioControl"
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 text-xs sm:text-sm rounded-lg px-3 py-2 transition-colors cursor-pointer"
            >
              <option value="Todos">Todos los Servicios</option>
              <option value="Almuerzo">Solo Almuerzos (Diurno)</option>
              <option value="Refrigerio">Solo Refrigerios (Noche)</option>
            </select>
          </div>

          <!-- 3. Filtro Carrera -->
          <div>
            <select
              [formControl]="carreraControl"
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 text-xs sm:text-sm rounded-lg px-3 py-2 transition-colors cursor-pointer"
            >
              <option value="TODAS">Todas las Carreras</option>
              @for (c of carreras(); track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- 4. Filtro Fecha -->
          <div>
            <input
              type="date"
              [formControl]="fechaControl"
              class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 text-xs sm:text-sm rounded-lg px-3 py-2 transition-colors cursor-pointer font-medium"
            />
          </div>
        </div>

        <!-- Pills selector rápido de Subsidio y Ordenamiento -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs font-semibold text-slate-400 mr-1">Filtrar:</span>
            <button
              type="button"
              (click)="subsidioControl.setValue('Todos')"
              [class]="subsidioControl.value === 'Todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Todos ({{ cafeteria.statsEntregas().totalEntregados }})
            </button>
            <button
              type="button"
              (click)="subsidioControl.setValue('Almuerzo')"
              [class]="subsidioControl.value === 'Almuerzo' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'"
              class="px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Almuerzos ({{ cafeteria.statsEntregas().almuerzos }})
            </button>
            <button
              type="button"
              (click)="subsidioControl.setValue('Refrigerio')"
              [class]="subsidioControl.value === 'Refrigerio' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'"
              class="px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Refrigerios ({{ cafeteria.statsEntregas().refrigerios }})
            </button>
          </div>

          <!-- Ordenar por -->
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-slate-400 font-semibold">Ordenar:</span>
            <select
              [formControl]="ordenControl"
              class="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 focus:bg-white cursor-pointer"
            >
              <option value="hora_desc">Más recientes primero (Hora ↓)</option>
              <option value="hora_asc">Más antiguos primero (Hora ↑)</option>
              <option value="nombre">Nombre Estudiante (A-Z)</option>
              <option value="codigo">Código ID</option>
            </select>
          </div>
        </div>
      </div>

      <!-- TABLA DE ENTREGADOS CON HORA -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-2">
            <mat-icon class="text-emerald-600 text-lg">fact_check</mat-icon>
            <h3 class="text-sm font-bold text-slate-800">
              Listado de Raciones Despachadas ({{ entregasFiltradas().length }})
            </h3>
          </div>
          <span class="text-xs text-slate-500 font-medium">
            Fecha: {{ fechaControl.value }}
          </span>
        </div>

        @if (entregasFiltradas().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr class="bg-slate-100/75 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <th class="py-3 px-4">#</th>
                  <th class="py-3 px-4 cursor-pointer hover:bg-slate-200/50 select-none transition-colors" (click)="onSort('hora')">
                    <span class="flex items-center gap-1">Hora de Entrega <span class="text-[9px] text-slate-400">{{ sortIcon('hora') }}</span></span>
                  </th>
                  <th class="py-3 px-4 cursor-pointer hover:bg-slate-200/50 select-none transition-colors" (click)="onSort('codigo')">
                    <span class="flex items-center gap-1">Código ID <span class="text-[9px] text-slate-400">{{ sortIcon('codigo') }}</span></span>
                  </th>
                  <th class="py-3 px-4 cursor-pointer hover:bg-slate-200/50 select-none transition-colors" (click)="onSort('nombre')">
                    <span class="flex items-center gap-1">Nombre del Estudiante <span class="text-[9px] text-slate-400">{{ sortIcon('nombre') }}</span></span>
                  </th>
                  <th class="py-3 px-4 cursor-pointer hover:bg-slate-200/50 select-none transition-colors" (click)="onSort('carrera')">
                    <span class="flex items-center gap-1">Programa Académico <span class="text-[9px] text-slate-400">{{ sortIcon('carrera') }}</span></span>
                  </th>
                  <th class="py-3 px-4 cursor-pointer hover:bg-slate-200/50 select-none transition-colors" (click)="onSort('tipo')">
                    <span class="flex items-center gap-1">Tipo Servicio <span class="text-[9px] text-slate-400">{{ sortIcon('tipo') }}</span></span>
                  </th>
                  <th class="py-3 px-4">Validación</th>
                  <th class="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                @for (c of entregasFiltradas(); track c.id; let idx = $index) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <!-- Indice -->
                    <td class="py-3 px-4 text-slate-400 text-xs font-mono">
                      {{ idx + 1 }}
                    </td>

                    <!-- Hora de Entrega -->
                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold font-mono">
                        <mat-icon class="text-sm text-emerald-600">schedule</mat-icon>
                        <span>{{ c.horaEntrega || c.timestamp.split(' ')[1] || 'Registrado' }}</span>
                      </div>
                    </td>

                    <!-- Código ID -->
                    <td class="py-3 px-4 whitespace-nowrap font-mono font-semibold text-slate-900">
                      {{ c.codigo }}
                    </td>

                    <!-- Nombre Estudiante -->
                    <td class="py-3 px-4 font-semibold text-slate-900">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {{ getInitials(c.nombre) }}
                        </div>
                        <span class="truncate max-w-[200px] sm:max-w-xs">{{ c.nombre }}</span>
                      </div>
                    </td>

                    <!-- Carrera -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-1.5">
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold" [class]="getVisual(c.carrera).color">
                          {{ getVisual(c.carrera).nombre }}
                        </span>
                        <span class="text-[10px] text-slate-400">({{ getVisual(c.carrera).jornada }})</span>
                      </div>
                    </td>

                    <!-- Tipo Subsidio -->
                    <td class="py-3 px-4 whitespace-nowrap">
                      @if (c.tipoSubsidio === 'Almuerzo') {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <mat-icon class="text-xs">lunch_dining</mat-icon>
                          Almuerzo
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          <mat-icon class="text-xs">nightlife</mat-icon>
                          Refrigerio
                        </span>
                      }
                    </td>

                    <!-- Origen / Validación -->
                    <td class="py-3 px-4 whitespace-nowrap text-xs">
                      @if (c.origen === 'Excepcional') {
                        <span class="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Ventanilla (Excepcional)
                        </span>
                      } @else if (c.difiereNombre) {
                        <span class="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200" title="Nombre difiere ligeramente del padrón">
                          Google Forms (Variación Nombre)
                        </span>
                      } @else {
                        <span class="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Confirmado Formulario
                        </span>
                      }
                    </td>

                    <!-- Acciones -->
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        (click)="deshacerEntrega(c)"
                        class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Deshacer entrega (marcar como no entregado)"
                      >
                        <mat-icon class="text-sm">undo</mat-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <!-- Estado vacío -->
          <div class="py-12 px-4 text-center">
            <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <mat-icon class="text-3xl">task_alt</mat-icon>
            </div>
            <h4 class="text-base font-bold text-slate-800 mb-1">No hay raciones entregadas aún</h4>
            <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
              Las raciones entregadas aparecerán en esta lista en tiempo real con su hora exacta una vez comiences a despachar a los estudiantes.
            </p>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <a
                routerLink="/confirmados"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <mat-icon class="text-sm">how_to_reg</mat-icon>
                <span>Ir al Panel de Confirmados</span>
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class Entregas {
  readonly cafeteria = inject(CafeteriaService);

  readonly carreras = computed(() => {
    const list = this.cafeteria.beneficiarios();
    const carreras = [...new Set(list.map(b => b.carrera).filter(c => c && c !== 'PROGRAMA ACADÉMICO'))];
    return carreras.sort();
  });

  // Form Controls
  readonly codigoInput = new FormControl('');
  readonly busquedaControl = new FormControl('');
  readonly subsidioControl = new FormControl<SubsidioFiltro>('Todos', { nonNullable: true });
  readonly carreraControl = new FormControl<string>('TODAS', { nonNullable: true });
  readonly fechaControl = new FormControl<string>(this.cafeteria.filtroFecha(), { nonNullable: true });
  readonly ordenControl = new FormControl<string>('hora_desc', { nonNullable: true });

  readonly despachoMensaje = signal<{ success: boolean; message: string } | null>(null);

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc' | ''>('');

  onSort(col: string): void {
    if (this.sortColumn() === col) {
      const dir = this.sortDirection();
      if (dir === '') { this.sortDirection.set('asc'); }
      else if (dir === 'asc') { this.sortDirection.set('desc'); }
      else { this.sortColumn.set(''); this.sortDirection.set(''); }
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  sortIcon(col: string): string {
    if (this.sortColumn() !== col) return '';
    return this.sortDirection() === 'asc' ? '▲' : '▼';
  }

  constructor() {
    // Listen to filter changes and synchronize with service
    this.busquedaControl.valueChanges.subscribe(val => {
      this.cafeteria.setFiltroBusqueda(val || '');
    });

    this.subsidioControl.valueChanges.subscribe(val => {
      this.cafeteria.setFiltroSubsidio(val || 'Todos');
    });

    this.carreraControl.valueChanges.subscribe(val => {
      this.cafeteria.setFiltroCarrera(val || 'TODAS');
    });

    this.fechaControl.valueChanges.subscribe(val => {
      this.cafeteria.setFiltroFecha(val || '');
    });
  }

  readonly entregasFiltradas = computed(() => {
    let list = [...this.cafeteria.entregadosFiltrados()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (col && dir) {
      list.sort((a, b) => {
        let av: string;
        let bv: string;
        switch (col) {
          case 'hora': av = a.horaEntrega || a.timestamp.split(' ')[1] || ''; bv = b.horaEntrega || b.timestamp.split(' ')[1] || ''; break;
          case 'codigo': av = a.codigo; bv = b.codigo; break;
          case 'nombre': av = a.nombre; bv = b.nombre; break;
          case 'carrera': av = a.carrera; bv = b.carrera; break;
          case 'tipo': av = a.tipoSubsidio; bv = b.tipoSubsidio; break;
          default: return 0;
        }
        const cmp = av.localeCompare(bv, 'es', { sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  });

  onDespachoRapido(event: Event): void {
    event.preventDefault();
    const code = this.codigoInput.value?.trim();
    if (!code) return;

    const res = this.cafeteria.despacharPorCodigo(code);
    this.despachoMensaje.set(res);
    this.codigoInput.setValue('');
  }

  deshacerEntrega(conf: Confirmacion): void {
    if (confirm(`¿Deseas revertir la entrega de ${conf.nombre} (${conf.codigo}) y dejarlo como pendiente?`)) {
      this.cafeteria.toggleEntregado(conf.id);
      this.despachoMensaje.set({
        success: true,
        message: `Entrega de ${conf.nombre} revertida correctamente a estado PENDIENTE.`
      });
    }
  }

  getVisual(carrera: string) {
    return getVisualCarrera(carrera);
  }

  getInitials(name: string): string {
    if (!name) return 'ES';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  imprimirActa(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
