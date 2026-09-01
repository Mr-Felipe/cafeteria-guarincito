import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CafeteriaService } from '../../services/cafeteria';
import { getVisualCarrera, Beneficiario, Confirmacion } from '../../models/cafeteria.models';
import { ModalPegarRespuestas } from '../../components/modal-pegar-respuestas/modal-pegar-respuestas';
import { ModalPlanilla } from '../../components/modal-planilla/modal-planilla';

@Component({
  selector: 'app-confirmados',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ReactiveFormsModule, ModalPegarRespuestas, ModalPlanilla],
  template: `
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            Monitoreo en Tiempo Real
          </span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Monitoreo de Confirmaciones</h2>
          <p class="text-sm text-slate-600">Control de asistencia y entregas sincronizado con Google Forms y Padrón iVMS-4200.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/entregas" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <mat-icon class="text-base">task_alt</mat-icon><span>Ver Entregadas</span>
          </a>
          <button type="button" (click)="onSyncSheets()" [disabled]="cafeteria.isSyncing()" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
            <mat-icon class="text-base" [class.animate-spin]="cafeteria.isSyncing()">sync</mat-icon>
            <span>{{ cafeteria.isSyncing() ? 'Sincronizando...' : 'Sincronizar Sheets' }}</span>
          </button>
          <button type="button" (click)="modalPegarOpen.set(true)" class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <mat-icon class="text-base text-slate-500">content_paste</mat-icon><span>Pegar</span>
          </button>
          <button type="button" (click)="cafeteria.exportarConfirmacionesCSV()" class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <mat-icon class="text-base text-slate-500">download</mat-icon><span>CSV</span>
          </button>
          <button type="button" (click)="modalPlanillaOpen.set(true)" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <mat-icon class="text-base">print</mat-icon><span>Planilla</span>
          </button>
        </div>
      </div>

      <!-- FEEDBACK BANNER -->
      @if (cafeteria.lastSyncMessage()) {
        <div class="p-4 rounded-xl border flex items-center justify-between gap-3 shadow-sm transition-all"
          [class.bg-emerald-50]="cafeteria.lastSyncMessage()?.type === 'success'"
          [class.border-emerald-200]="cafeteria.lastSyncMessage()?.type === 'success'"
          [class.text-emerald-900]="cafeteria.lastSyncMessage()?.type === 'success'"
          [class.bg-red-50]="cafeteria.lastSyncMessage()?.type === 'error'"
          [class.border-red-200]="cafeteria.lastSyncMessage()?.type === 'error'"
          [class.text-red-900]="cafeteria.lastSyncMessage()?.type === 'error'"
        >
          <div class="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <mat-icon class="text-lg">{{ cafeteria.lastSyncMessage()?.type === 'success' ? 'check_circle' : 'error' }}</mat-icon>
            <span>{{ cafeteria.lastSyncMessage()?.text }}</span>
          </div>
          <button type="button" (click)="cafeteria.clearSyncMessage()" class="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <mat-icon class="text-base">close</mat-icon>
          </button>
        </div>
      }

      <!-- FILTROS: TIPO + FECHA -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <!-- Tipo de Subsidio -->
          <div class="md:col-span-5">
            <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tipo de Subsidio</span>
            <div class="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
              <button type="button" (click)="cafeteria.setFiltroSubsidio('Todos')" class="flex-1 py-1.5 px-2.5 rounded-md text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium" [class.bg-white]="cafeteria.filtroSubsidio() === 'Todos'" [class.text-slate-900]="cafeteria.filtroSubsidio() === 'Todos'" [class.font-bold]="cafeteria.filtroSubsidio() === 'Todos'" [class.shadow-xs]="cafeteria.filtroSubsidio() === 'Todos'" [class.text-slate-600]="cafeteria.filtroSubsidio() !== 'Todos'">
                <mat-icon class="text-sm">layers</mat-icon><span>Todos</span>
              </button>
              <button type="button" (click)="cafeteria.setFiltroSubsidio('Almuerzo')" class="flex-1 py-1.5 px-2.5 rounded-md text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium" [class.bg-white]="cafeteria.filtroSubsidio() === 'Almuerzo'" [class.text-emerald-700]="cafeteria.filtroSubsidio() === 'Almuerzo'" [class.font-bold]="cafeteria.filtroSubsidio() === 'Almuerzo'" [class.shadow-xs]="cafeteria.filtroSubsidio() === 'Almuerzo'" [class.text-slate-600]="cafeteria.filtroSubsidio() !== 'Almuerzo'">
                <mat-icon class="text-sm">wb_sunny</mat-icon><span>Almuerzo</span>
              </button>
              <button type="button" (click)="cafeteria.setFiltroSubsidio('Refrigerio')" class="flex-1 py-1.5 px-2.5 rounded-md text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium" [class.bg-white]="cafeteria.filtroSubsidio() === 'Refrigerio'" [class.text-blue-700]="cafeteria.filtroSubsidio() === 'Refrigerio'" [class.font-bold]="cafeteria.filtroSubsidio() === 'Refrigerio'" [class.shadow-xs]="cafeteria.filtroSubsidio() === 'Refrigerio'" [class.text-slate-600]="cafeteria.filtroSubsidio() !== 'Refrigerio'">
                <mat-icon class="text-sm">nights_stay</mat-icon><span>Refrigerio</span>
              </button>
              <button type="button" (click)="cafeteria.setFiltroSubsidio('Desayuno')" class="flex-1 py-1.5 px-2.5 rounded-md text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium" [class.bg-white]="cafeteria.filtroSubsidio() === 'Desayuno'" [class.text-orange-700]="cafeteria.filtroSubsidio() === 'Desayuno'" [class.font-bold]="cafeteria.filtroSubsidio() === 'Desayuno'" [class.shadow-xs]="cafeteria.filtroSubsidio() === 'Desayuno'" [class.text-slate-600]="cafeteria.filtroSubsidio() !== 'Desayuno'">
                <mat-icon class="text-sm">free_breakfast</mat-icon><span>Desayuno</span>
              </button>
            </div>
          </div>
          <!-- Fecha -->
          <div class="md:col-span-4">
            <label for="filtro-fecha-input" class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fecha de Servicio</label>
            <div class="flex items-center gap-1.5">
              <button type="button" (click)="shiftDate(-1)" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"><mat-icon class="text-sm">chevron_left</mat-icon></button>
              <input id="filtro-fecha-input" type="date" [value]="cafeteria.filtroFecha()" (change)="onDateChange($event)" class="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"/>
              <button type="button" (click)="shiftDate(1)" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"><mat-icon class="text-sm">chevron_right</mat-icon></button>
              <button type="button" (click)="setTodayDate()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer">Hoy</button>
            </div>
          </div>
        </div>
      </div>

      <!-- KPIS -->
      <section class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div><div class="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Confirmados</div><div class="text-2xl font-bold text-slate-900">{{ cafeteria.kpiStats().total }}</div></div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden"><div class="bg-blue-500 h-full" [style.width.%]="cafeteria.beneficiarios().length > 0 ? (cafeteria.kpiStats().total / cafeteria.beneficiarios().length * 100) : 0"></div></div>
        </div>
        <a routerLink="/entregas" class="bg-white hover:bg-emerald-50/50 transition-colors p-5 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-sm flex flex-col justify-between group cursor-pointer">
          <div><div class="flex items-center justify-between"><span class="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">Entregadas</span><mat-icon class="text-xs text-emerald-500 group-hover:translate-x-0.5 transition-transform">arrow_forward</mat-icon></div><div class="text-2xl font-bold text-slate-900">{{ cafeteria.kpiStats().entregadas }}</div></div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden"><div class="bg-emerald-500 h-full" [style.width.%]="cafeteria.kpiStats().total > 0 ? (cafeteria.kpiStats().entregadas / cafeteria.kpiStats().total * 100) : 0"></div></div>
        </a>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div><div class="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Pendientes</div><div class="text-2xl font-bold text-slate-900">{{ cafeteria.kpiStats().pendientes }}</div></div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden"><div class="bg-orange-500 h-full" [style.width.%]="cafeteria.kpiStats().total > 0 ? (cafeteria.kpiStats().pendientes / cafeteria.kpiStats().total * 100) : 0"></div></div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div><div class="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">En Padrón</div><div class="text-2xl font-bold text-slate-900">{{ cafeteria.kpiStats().enPadron }}</div></div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden"><div class="bg-blue-500 h-full" [style.width.%]="100"></div></div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" [class.bg-purple-50]="cafeteria.kpiStats().extranos > 0" [class.border-purple-200]="cafeteria.kpiStats().extranos > 0">
          <div><div class="text-xs font-semibold uppercase tracking-wider mb-1" [class.text-purple-800]="cafeteria.kpiStats().extranos > 0" [class.text-slate-500]="cafeteria.kpiStats().extranos === 0">Extraños</div><div class="text-2xl font-bold" [class.text-purple-950]="cafeteria.kpiStats().extranos > 0" [class.text-slate-900]="cafeteria.kpiStats().extranos === 0">{{ cafeteria.kpiStats().extranos }}</div></div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden"><div class="bg-purple-500 h-full" [style.width.%]="cafeteria.kpiStats().extranos > 0 ? 100 : 0"></div></div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm bg-blue-50 border-blue-100 flex flex-col justify-between">
          <div><div class="text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">Sin Confirmar ({{ dayName() }})</div><div class="text-2xl font-bold text-blue-900">{{ cafeteria.noConfirmaron().length }}</div></div>
          <div class="text-xs text-blue-600 mt-2 font-medium">Raciones liberadas</div>
        </div>
      </section>

      <!-- DESPACHO POR BÚSQUEDA -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 text-white shadow-md">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex items-center gap-3 shrink-0">
            <div class="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <mat-icon class="text-xl">qr_code_scanner</mat-icon>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white leading-tight">Despacho Rápido</h3>
              <p class="text-xs text-slate-300">Buscar y entregar al instante</p>
            </div>
          </div>
          <div class="flex-1 flex items-center gap-2">
            <div class="relative flex-1">
              <input type="text" [formControl]="busquedaDespacho" (input)="buscarParaDespachar()" placeholder="Código ID o nombre del estudiante..." class="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-400 text-sm rounded-lg px-3 py-2 pl-9 font-mono uppercase transition-all"/>
              <mat-icon class="absolute left-2.5 top-2.5 text-slate-400 text-sm">search</mat-icon>
            </div>
          </div>
        </div>
        @if (resultadoDespacho()) {
          <div class="mt-3 p-3 rounded-lg border flex items-center justify-between gap-3" [class.bg-emerald-900/40]="resultadoDespacho()!.success" [class.border-emerald-700]="resultadoDespacho()!.success" [class.bg-red-900/40]="!resultadoDespacho()!.success" [class.border-red-700]="!resultadoDespacho()!.success">
            <div class="flex items-center gap-3">
              @if (resultadoDespacho()!.conf) {
                @let c = resultadoDespacho()!.conf!;
                @let visual = getVisual(c.carrera);
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" [class]="resultadoDespacho()!.success ? 'bg-emerald-600' : 'bg-red-600'">
                  {{ getInitials(c.nombre) }}
                </div>
                <div>
                  <p class="text-sm font-bold text-white">{{ c.nombre }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="font-mono text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">ID: {{ c.codigo }}</span>
                    <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded border" [class]="visual.badgeClass">{{ c.carrera }}</span>
                  </div>
                </div>
              } @else {
                <mat-icon class="text-lg" [class.text-emerald-400]="resultadoDespacho()!.success" [class.text-red-400]="!resultadoDespacho()!.success">{{ resultadoDespacho()!.success ? 'check_circle' : 'warning' }}</mat-icon>
                <p class="text-sm font-semibold text-white">{{ resultadoDespacho()!.message }}</p>
              }
            </div>
            <div class="flex items-center gap-2 shrink-0">
              @if (resultadoDespacho()!.conf && !resultadoDespacho()!.conf!.entregado) {
                <button type="button" (click)="entregarDesdeBusqueda()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer">
                  <mat-icon class="text-sm">check_circle</mat-icon><span>Entregar</span>
                </button>
              }
              <button type="button" (click)="resultadoDespacho.set(null)" class="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"><mat-icon class="text-base">close</mat-icon></button>
            </div>
          </div>
        }
      </div>

      <!-- ACORDEONES -->
      <div class="space-y-4">

        <!-- 1: CONFIRMADOS VÁLIDOS -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button type="button" class="w-full text-left p-4 sm:p-5 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer border-b border-slate-200" (click)="toggleAccordionValidos()">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0"><mat-icon class="text-lg">verified</mat-icon></div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Confirmaciones Válidas</h3>
                  <span class="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">{{ confirmadosValidosFiltrados().length }}</span>
                </div>
                <p class="text-xs text-slate-500">Estudiantes verificados en el padrón, pendientes de entrega</p>
              </div>
            </div>
            <mat-icon class="text-slate-400 transition-transform duration-200" [class.rotate-180]="accordionValidosOpen()">expand_more</mat-icon>
          </button>
          @if (accordionValidosOpen()) {
            <div class="p-4 sm:p-5 space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div class="relative flex-1 max-w-md">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</mat-icon>
                  <input type="text" [value]="busquedaValidos()" (input)="busquedaValidos.set($any($event.target).value)" placeholder="Buscar por código, nombre..." class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
                </div>
                <select [value]="carreraValidos()" (change)="carreraValidos.set($any($event.target).value)" class="p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none">
                  <option value="TODAS">Todas las carreras</option>
                  @for (c of carrerasEnConfirmaciones(); track c) { <option [value]="c">{{ c }}</option> }
                </select>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                @for (c of confirmadosValidosFiltrados(); track c.id) {
                  @let visual = getVisual(c.carrera);
                  <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
                    <div>
                      <div class="flex items-center justify-between gap-1.5 mb-2">
                        <span class="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">ID: {{ c.codigo }}</span>
                        <div class="flex items-center gap-1">
                          <span class="px-2 py-0.5 text-[10px] font-semibold rounded border flex items-center gap-1 {{ visual.badgeClass }}">
                            <mat-icon class="text-[12px]">{{ visual.icono }}</mat-icon>
                            <span class="truncate max-w-[90px]">{{ c.carrera }}</span>
                          </span>
                          <span class="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{{ c.timestamp.split(' ')[1] || c.timestamp }}</span>
                        </div>
                      </div>
                      <h4 class="font-semibold text-sm text-slate-900">{{ c.nombre }}</h4>
                      <div class="flex flex-wrap items-center gap-1.5 mt-2">
                        <span class="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">VERIFICADO</span>
                        @if (c.tipoSubsidio === 'Almuerzo') {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Almuerzo</span>
                        } @else if (c.tipoSubsidio === 'Refrigerio') {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Refrigerio</span>
                        } @else {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">Desayuno</span>
                        }
                        @if (c.difiereNombre) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1" title="Nombre en padrón: {{ c.nombrePadron }}">
                            <mat-icon class="text-[12px]">info</mat-icon>Difiere en Padrón
                          </span>
                        }
                      </div>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-100">
                      <button type="button" (click)="cafeteria.toggleEntregado(c.id)" class="w-full px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                        <mat-icon class="text-sm">check_circle</mat-icon><span>Marcar Entrega</span>
                      </button>
                    </div>
                  </div>
                }
                @if (confirmadosValidosFiltrados().length === 0) {
                  <div class="col-span-full p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-500">
                    <mat-icon class="text-4xl text-slate-400 mb-1">sentiment_dissatisfied</mat-icon>
                    <p class="text-sm font-semibold">No hay confirmados válidos para el filtro actual.</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- 2: EXTRAÑOS -->
        <div class="bg-amber-50/30 border border-amber-200 rounded-xl shadow-sm overflow-hidden">
          <button type="button" class="w-full text-left p-4 sm:p-5 hover:bg-amber-50/50 transition-colors flex items-center justify-between cursor-pointer border-b border-amber-200" (click)="toggleAccordionExtranos()">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><mat-icon class="text-lg">warning_amber</mat-icon></div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Confirmaciones Externas</h3>
                  <span class="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{{ confirmadosExtranosFiltrados().length }}</span>
                </div>
                <p class="text-xs text-slate-500">Su código no figura en el padrón o la carrera no coincide</p>
              </div>
            </div>
            <mat-icon class="text-slate-400 transition-transform duration-200" [class.rotate-180]="accordionExtranosOpen()">expand_more</mat-icon>
          </button>
          @if (accordionExtranosOpen()) {
            <div class="p-4 sm:p-5 space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div class="relative flex-1 max-w-md">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</mat-icon>
                  <input type="text" [value]="busquedaExtranos()" (input)="busquedaExtranos.set($any($event.target).value)" placeholder="Buscar por código, nombre..." class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
                </div>
                <select [value]="carreraExtranos()" (change)="carreraExtranos.set($any($event.target).value)" class="p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none">
                  <option value="TODAS">Todas las carreras</option>
                  @for (c of carrerasEnExtranos(); track c) { <option [value]="c">{{ c }}</option> }
                </select>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                @for (c of confirmadosExtranosFiltrados(); track c.id) {
                  @let visual = getVisual(c.carrera);
                  <div class="bg-white border border-amber-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
                    <div>
                      <div class="flex items-center justify-between gap-1.5 mb-2">
                        <span class="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">ID: {{ c.codigo }}</span>
                        <div class="flex items-center gap-1">
                          <span class="px-2 py-0.5 text-[10px] font-semibold rounded border flex items-center gap-1 {{ visual.badgeClass }}">
                            <mat-icon class="text-[12px]">{{ visual.icono }}</mat-icon>
                            <span class="truncate max-w-[90px]">{{ c.carrera }}</span>
                          </span>
                          <span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">EXTERNAL</span>
                          <span class="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{{ c.timestamp.split(' ')[1] || c.timestamp }}</span>
                        </div>
                      </div>
                      <h4 class="font-semibold text-sm text-slate-900">{{ c.nombre }}</h4>
                      @if (c.observacion) {
                        <p class="text-[11px] text-amber-600 font-medium mt-1 italic">{{ c.observacion }}</p>
                      }
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span class="text-[11px] font-medium text-slate-600">{{ c.entregado ? 'Autorizado (' + (c.horaEntrega || 'OK') + ')' : 'Sin Autorizar' }}</span>
                      <button type="button" (click)="cafeteria.autorizarExtrano(c)" class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer" [class.bg-slate-900]="c.entregado" [class.text-white]="c.entregado" [class.bg-white]="!c.entregado" [class.text-slate-700]="!c.entregado" [class.hover:bg-slate-50]="!c.entregado">
                        {{ c.entregado ? 'Ración Autorizada' : 'Autorizar Entrega' }}
                      </button>
                    </div>
                  </div>
                }
                @if (confirmadosExtranosFiltrados().length === 0) {
                  <div class="col-span-full p-6 text-center text-slate-500 text-xs font-semibold bg-white rounded-xl border border-dashed border-slate-200">No se detectan estudiantes externos para este filtro.</div>
                }
              </div>
            </div>
          }
        </div>

        <!-- 3: NO CONFIRMARON -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button type="button" class="w-full text-left p-4 sm:p-5 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer border-b border-slate-200" (click)="toggleAccordionNoConfirmaron()">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0"><mat-icon class="text-lg">person_off</mat-icon></div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Beneficiarios Sin Confirmar</h3>
                  <span class="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold">{{ cafeteria.noConfirmaron().length }}</span>
                </div>
                <p class="text-xs text-slate-500">Estudiantes con derecho a subsidio que aún no han registrado confirmación</p>
              </div>
            </div>
            <mat-icon class="text-slate-400 transition-transform duration-200" [class.rotate-180]="accordionNoConfirmaronOpen()">expand_more</mat-icon>
          </button>
          @if (accordionNoConfirmaronOpen()) {
            <div class="p-4 sm:p-5 space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div class="relative flex-1 max-w-md">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</mat-icon>
                  <input type="text" [value]="busquedaNoConfirmaron()" (input)="busquedaNoConfirmaron.set($any($event.target).value)" placeholder="Buscar por código, nombre..." class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
                </div>
                <select [value]="cafeteria.filtroNoConfirmaronCarrera()" (change)="onNoConfirmaronCarreraChange($event)" class="p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none">
                  <option value="TODAS">Todas las carreras</option>
                  @for (c of carrerasList(); track c) { <option [value]="c">{{ c }}</option> }
                </select>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                @for (b of noConfirmaronFiltrados(); track b.codigo) {
                  @let visual = getVisual(b.carrera);
                  <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
                    <div>
                      <div class="flex items-center justify-between gap-1.5 mb-1.5">
                        <span class="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">ID: {{ b.codigo }}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Sin Confirmación</span>
                      </div>
                      <h4 class="font-semibold text-sm text-slate-900">{{ b.nombre }}</h4>
                      <div class="flex items-center gap-1 mt-1">
                        <span class="px-2 py-0.5 text-[10px] font-semibold rounded border flex items-center gap-1 {{ visual.badgeClass }}">
                          <mat-icon class="text-[12px]">{{ visual.icono }}</mat-icon>{{ b.carrera }}
                        </span>
                        <span class="text-[10px] font-semibold text-slate-500">· {{ b.subsidio }}</span>
                      </div>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-100">
                      <button type="button" (click)="onEntregaExcepcional(b)" class="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">Entrega Excepcional</button>
                    </div>
                  </div>
                }
                @if (noConfirmaronFiltrados().length === 0) {
                  <div class="col-span-full p-6 text-center text-slate-500 text-xs font-semibold bg-white rounded-xl border border-dashed border-slate-200">¡Excelente! Todos los estudiantes han confirmado.</div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <app-modal-pegar-respuestas [isOpen]="modalPegarOpen()" (modalClose)="modalPegarOpen.set(false)" />
    <app-modal-planilla [isOpen]="modalPlanillaOpen()" (modalClose)="modalPlanillaOpen.set(false)" />
  `
})
export class Confirmados {
  readonly cafeteria = inject(CafeteriaService);

  readonly carrerasList = computed(() => {
    const list = this.cafeteria.beneficiarios();
    const carreras = [...new Set(list.map(b => b.carrera).filter(c => c && c !== 'PROGRAMA ACADÉMICO'))];
    return carreras.sort();
  });

  readonly dayName = computed(() => {
    const fecha = this.cafeteria.filtroFecha();
    const d = new Date(fecha + 'T12:00:00');
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[d.getDay()];
  });

  modalPegarOpen = signal<boolean>(false);
  modalPlanillaOpen = signal<boolean>(false);

  accordionValidosOpen = signal<boolean>(true);
  accordionExtranosOpen = signal<boolean>(true);
  accordionNoConfirmaronOpen = signal<boolean>(true);

  // Despacho rápido por búsqueda
  readonly busquedaDespacho = new FormControl('');
  readonly resultadoDespacho = signal<{ success: boolean; message: string; conf?: Confirmacion } | null>(null);

  // Per-section filters
  busquedaValidos = signal('');
  carreraValidos = signal('TODAS');
  busquedaExtranos = signal('');
  carreraExtranos = signal('TODAS');
  busquedaNoConfirmaron = signal('');

  // Careers that appear in valid confirmations
  readonly carrerasEnConfirmaciones = computed(() => {
    const confs = this.cafeteria.confirmadosValidos();
    return [...new Set(confs.map(c => c.carrera))].sort();
  });

  // Careers that appear in external confirmations
  readonly carrerasEnExtranos = computed(() => {
    const confs = this.cafeteria.confirmadosExtranos();
    return [...new Set(confs.map(c => c.carrera))].sort();
  });

  // Filtered valid confirmations
  readonly confirmadosValidosFiltrados = computed(() => {
    let list = this.cafeteria.confirmadosValidos();
    const busq = this.busquedaValidos().toLowerCase().trim();
    const carrera = this.carreraValidos();
    if (carrera !== 'TODAS') {
      list = list.filter(c => c.carrera === carrera);
    }
    if (busq) {
      list = list.filter(c =>
        c.codigo.toLowerCase().includes(busq) ||
        c.nombre.toLowerCase().includes(busq) ||
        c.carrera.toLowerCase().includes(busq)
      );
    }
    return list;
  });

  // Filtered external confirmations
  readonly confirmadosExtranosFiltrados = computed(() => {
    let list = this.cafeteria.confirmadosExtranos();
    const busq = this.busquedaExtranos().toLowerCase().trim();
    const carrera = this.carreraExtranos();
    if (carrera !== 'TODAS') {
      list = list.filter(c => c.carrera === carrera);
    }
    if (busq) {
      list = list.filter(c =>
        c.codigo.toLowerCase().includes(busq) ||
        c.nombre.toLowerCase().includes(busq) ||
        c.carrera.toLowerCase().includes(busq)
      );
    }
    return list;
  });

  // Filtered no-confirmaron
  readonly noConfirmaronFiltrados = computed(() => {
    let list = this.cafeteria.noConfirmaron();
    const busq = this.busquedaNoConfirmaron().toLowerCase().trim();
    if (busq) {
      list = list.filter(b =>
        b.codigo.toLowerCase().includes(busq) ||
        b.nombre.toLowerCase().includes(busq) ||
        b.carrera.toLowerCase().includes(busq)
      );
    }
    return list;
  });

  toggleAccordionValidos(): void {
    this.accordionValidosOpen.update(v => !v);
  }

  toggleAccordionExtranos(): void {
    this.accordionExtranosOpen.update(v => !v);
  }

  toggleAccordionNoConfirmaron(): void {
    this.accordionNoConfirmaronOpen.update(v => !v);
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

  onSyncSheets(): void {
    this.cafeteria.sincronizarConGoogleSheets();
  }

  onDateChange(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    if (val) this.cafeteria.setFiltroFecha(val);
  }

  setTodayDate(): void {
    const now = new Date();
    const dStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.cafeteria.setFiltroFecha(dStr);
  }

  shiftDate(days: number): void {
    const current = this.cafeteria.filtroFecha();
    const d = new Date(current + 'T12:00:00');
    d.setDate(d.getDate() + days);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.cafeteria.setFiltroFecha(dStr);
  }

  buscarParaDespachar(): void {
    const raw = this.busquedaDespacho.value?.trim();
    if (!raw) { this.resultadoDespacho.set(null); return; }
    const code = raw.toLowerCase();
    const fecha = this.cafeteria.filtroFecha();
    const all = this.cafeteria.confirmaciones();
    const match = all.find(c => c.fecha === fecha && (c.codigo.trim().toLowerCase() === code || c.nombre.toLowerCase().includes(code)));
    if (match) {
      this.resultadoDespacho.set({ success: !match.entregado, message: match.entregado ? `Ya entregado a las ${match.horaEntrega}` : 'Listo para entregar', conf: match });
    } else {
      const padron = this.cafeteria.beneficiarios().find(b => b.codigo.trim().toLowerCase() === code || b.nombre.toLowerCase().includes(code));
      if (padron) {
        this.resultadoDespacho.set({ success: false, message: `${padron.nombre} está en padrón pero no confirmó para hoy.` });
      } else {
        this.resultadoDespacho.set({ success: false, message: `Código [${raw}] no encontrado.` });
      }
    }
  }

  entregarDesdeBusqueda(): void {
    const res = this.resultadoDespacho();
    if (res?.conf && !res.conf.entregado) {
      this.cafeteria.toggleEntregado(res.conf.id);
      this.resultadoDespacho.set({ success: true, message: `¡Entregado! ${res.conf.nombre}`, conf: { ...res.conf, entregado: true } });
      this.busquedaDespacho.setValue('');
    }
  }

  onNoConfirmaronCarreraChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.cafeteria.setFiltroNoConfirmaronCarrera(val);
  }

  onEntregaExcepcional(b: Beneficiario): void {
    const filtro = this.cafeteria.filtroSubsidio();
    const tipo = filtro === 'Refrigerio' ? 'Refrigerio' : filtro === 'Desayuno' ? 'Desayuno' : 'Almuerzo';
    if (confirm(`¿Registrar entrega excepcional de ${tipo} para ${b.nombre} (${b.codigo})?`)) {
      this.cafeteria.marcarEntregaExcepcional(b, tipo);
    }
  }
}
