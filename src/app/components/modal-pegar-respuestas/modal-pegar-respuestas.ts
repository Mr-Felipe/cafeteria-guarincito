import { ChangeDetectionStrategy, Component, inject, signal, output, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CafeteriaService } from '../../services/cafeteria';

@Component({
  selector: 'app-modal-pegar-respuestas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
        <div class="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <mat-icon class="text-xl">content_paste</mat-icon>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900">Pegar Respuestas de Google Sheets</h3>
                <p class="text-xs text-slate-500">Copia y pega las filas directamente desde la hoja de cálculo</p>
              </div>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Body Form -->
          <form [formGroup]="pasteForm" (ngSubmit)="onSubmit()" class="flex-1 overflow-y-auto py-4 space-y-4">
            <!-- Subsidy Type Selection -->
            <div>
              <span class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipo de Subsidio Asignado
              </span>
              <div class="grid grid-cols-3 gap-2">
                <label for="sub-auto" class="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer transition-all hover:bg-slate-50"
                  [class.bg-blue-50]="pasteForm.get('tipo')?.value === 'Auto'"
                  [class.border-blue-500]="pasteForm.get('tipo')?.value === 'Auto'">
                  <input id="sub-auto" type="radio" formControlName="tipo" value="Auto" class="accent-blue-600" />
                  <span class="text-xs font-semibold text-slate-800">Auto-detectar</span>
                </label>
                <label for="sub-alm" class="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer transition-all hover:bg-slate-50"
                  [class.bg-amber-50]="pasteForm.get('tipo')?.value === 'Almuerzo'"
                  [class.border-amber-500]="pasteForm.get('tipo')?.value === 'Almuerzo'">
                  <input id="sub-alm" type="radio" formControlName="tipo" value="Almuerzo" class="accent-amber-600" />
                  <span class="text-xs font-semibold text-amber-900">Almuerzo</span>
                </label>
                <label for="sub-ref" class="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer transition-all hover:bg-slate-50"
                  [class.bg-indigo-50]="pasteForm.get('tipo')?.value === 'Refrigerio'"
                  [class.border-indigo-500]="pasteForm.get('tipo')?.value === 'Refrigerio'">
                  <input id="sub-ref" type="radio" formControlName="tipo" value="Refrigerio" class="accent-indigo-600" />
                  <span class="text-xs font-semibold text-indigo-900">Refrigerio</span>
                </label>
              </div>
            </div>

            <!-- Textarea -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="pastedText" class="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Contenido Tabulado / CSV (Columnas del Formulario)
                </label>
                <span class="text-[11px] text-slate-400">Timestamp | Carrera | Código | Nombre</span>
              </div>
              <textarea
                id="pastedText"
                formControlName="rawText"
                rows="8"
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                placeholder="2026-08-30 08:14:02	INGENIERÍA DE SISTEMAS	202410101	CARLOS ANDRÉS MENDOZA ROA&#10;2026-08-30 08:15:30	ADMINISTRACIÓN DE EMPRESAS	202320145	MATEO GONZÁLEZ RESTREPO"
              ></textarea>
            </div>

            @if (resultMsg()) {
              <div 
                class="p-3 rounded-lg text-xs font-semibold flex items-center gap-2"
                [class.bg-emerald-50]="resultMsg()?.type === 'success'"
                [class.text-emerald-900]="resultMsg()?.type === 'success'"
                [class.border]="true"
                [class.border-emerald-200]="resultMsg()?.type === 'success'"
                [class.bg-red-50]="resultMsg()?.type === 'error'"
                [class.text-red-900]="resultMsg()?.type === 'error'"
                [class.border-red-200]="resultMsg()?.type === 'error'"
              >
                <mat-icon class="text-base">{{ resultMsg()?.type === 'success' ? 'check_circle' : 'error' }}</mat-icon>
                <span>{{ resultMsg()?.text }}</span>
              </div>
            }
          </form>

          <!-- Footer Actions -->
          <div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="onClose()"
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="pasteForm.invalid"
              class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <mat-icon class="text-sm">done_all</mat-icon>
              <span>Procesar e Importar</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalPegarRespuestas {
  private cafeteria = inject(CafeteriaService);

  isOpen = input<boolean>(false);
  modalClose = output<void>();

  resultMsg = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  pasteForm = new FormGroup({
    tipo: new FormControl<'Auto' | 'Almuerzo' | 'Refrigerio'>('Auto', { nonNullable: true }),
    rawText: new FormControl<string>('', { validators: [Validators.required], nonNullable: true })
  });

  onClose(): void {
    this.resultMsg.set(null);
    this.pasteForm.reset({ tipo: 'Auto', rawText: '' });
    this.modalClose.emit();
  }

  onSubmit(): void {
    if (this.pasteForm.invalid) return;

    const raw = this.pasteForm.get('rawText')?.value || '';
    const tipo = this.pasteForm.get('tipo')?.value || 'Auto';

    const res = this.cafeteria.importarConfirmacionesCSV(raw, tipo);

    if (res.total === 0) {
      this.resultMsg.set({
        type: 'error',
        text: 'No se detectaron filas válidas en el texto proporcionado.'
      });
      return;
    }

    this.resultMsg.set({
      type: 'success',
      text: `¡Éxito! Se procesaron ${res.total} registros (${res.nuevos} nuevas confirmaciones agregadas).`
    });

    setTimeout(() => {
      this.onClose();
    }, 1200);
  }
}

