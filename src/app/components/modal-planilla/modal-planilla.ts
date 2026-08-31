import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CafeteriaService } from '../../services/cafeteria';

@Component({
  selector: 'app-modal-planilla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in print:p-0 print:bg-white">
        <div class="bg-white rounded-xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:p-2">
          <!-- Print Control Header (hidden on print) -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <mat-icon class="text-xl">print</mat-icon>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900">Planilla de Control y Firmas</h3>
                <p class="text-xs text-slate-500">Planilla física para el servicio de comedor</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="printDoc()"
                class="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
              >
                <mat-icon class="text-sm">print</mat-icon>
                <span>Imprimir Planilla</span>
              </button>
              <button
                type="button"
                (click)="modalClose.emit()"
                class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Printable Sheet Area -->
          <div class="flex-1 overflow-y-auto py-6 print:py-0 print:overflow-visible space-y-4 text-slate-900">
            <!-- Institutional Header -->
            <div class="border-b-2 border-slate-900 pb-4 text-center">
              <span class="text-xs font-bold uppercase tracking-widest text-slate-600 block">
                Universidad de Caldas · Sede Guarincito
              </span>
              <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight mt-1">
                Planilla de Entrega de Subsidio de Alimentación
              </h2>
              <div class="flex items-center justify-center gap-6 mt-2 text-xs font-semibold text-slate-700">
                <span>Fecha: <strong class="text-slate-950 font-bold">{{ cafeteria.filtroFecha() }}</strong></span>
                <span>Servicio: <strong class="text-slate-950 font-bold">{{ cafeteria.filtroSubsidio() }}</strong></span>
                <span>Total Confirmados: <strong class="text-slate-950 font-bold">{{ cafeteria.confirmadosValidos().length }}</strong></span>
              </div>
            </div>

            <!-- List Table -->
            <table class="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr class="bg-slate-100 border-b border-slate-300 text-slate-800 uppercase font-bold text-[10px]">
                  <th class="p-2 border-r border-slate-300 w-8 text-center">#</th>
                  <th class="p-2 border-r border-slate-300 w-24">Código</th>
                  <th class="p-2 border-r border-slate-300">Estudiante</th>
                  <th class="p-2 border-r border-slate-300">Carrera / Programa</th>
                  <th class="p-2 border-r border-slate-300 w-20 text-center">Subsidio</th>
                  <th class="p-2 border-r border-slate-300 w-24 text-center">Hora Reg.</th>
                  <th class="p-2 border-r border-slate-300 w-28 text-center">Estado</th>
                  <th class="p-2 w-36 text-center">Firma / Huella</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (c of cafeteria.confirmadosValidos(); track c.id; let idx = $index) {
                  <tr class="hover:bg-slate-50/50">
                    <td class="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-500">{{ idx + 1 }}</td>
                    <td class="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{{ c.codigo }}</td>
                    <td class="p-2 border-r border-slate-200 font-semibold uppercase text-slate-900">{{ c.nombre }}</td>
                    <td class="p-2 border-r border-slate-200 text-[11px] text-slate-700">{{ c.carrera }}</td>
                    <td class="p-2 border-r border-slate-200 text-center font-semibold text-[11px]">{{ c.tipoSubsidio }}</td>
                    <td class="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-600">
                      {{ c.timestamp.split(' ')[1] || c.timestamp }}
                    </td>
                    <td class="p-2 border-r border-slate-200 text-center font-semibold text-[10px]">
                      {{ c.entregado ? 'ENTREGADO (' + (c.horaEntrega || 'OK') + ')' : 'PENDIENTE' }}
                    </td>
                    <td class="p-2 border-slate-200 h-10 border-b"></td>
                  </tr>
                }
                @if (cafeteria.confirmadosValidos().length === 0) {
                  <tr>
                    <td colspan="8" class="p-6 text-center text-slate-400 italic">
                      No hay registros confirmados para los filtros seleccionados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <!-- Signatures Section -->
            <div class="grid grid-cols-2 gap-8 pt-8 text-center text-xs font-semibold text-slate-700">
              <div>
                <div class="border-t border-slate-800 w-3/4 mx-auto pt-1">
                  Firma Responsable de Cafetería
                </div>
              </div>
              <div>
                <div class="border-t border-slate-800 w-3/4 mx-auto pt-1">
                  Firma Bienestar Universitario / Auditor
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalPlanilla {
  readonly cafeteria = inject(CafeteriaService);

  isOpen = input<boolean>(false);
  modalClose = output<void>();

  printDoc(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}

