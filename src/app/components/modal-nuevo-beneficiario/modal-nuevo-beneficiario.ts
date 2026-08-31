import { ChangeDetectionStrategy, Component, inject, output, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CafeteriaService } from '../../services/cafeteria';
import { Beneficiario, CARRERAS_REGISTRADAS, Genero, TipoSubsidio } from '../../models/cafeteria.models';

@Component({
  selector: 'app-modal-nuevo-beneficiario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-stone-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <mat-icon class="text-xl">person_add</mat-icon>
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-stone-900">Registrar Nuevo Beneficiario</h3>
                <p class="text-xs text-stone-500">Padrón oficial de subsidiados iVMS-4200</p>
              </div>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Form -->
          <form [formGroup]="benForm" (ngSubmit)="onSubmit()" class="flex-1 overflow-y-auto py-4 space-y-4">
            <!-- Código Estudiantil -->
            <div>
              <label for="benCodigo" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Código Estudiantil / ID *
              </label>
              <input
                id="benCodigo"
                type="text"
                formControlName="codigo"
                placeholder="Ej: 202410889"
                class="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 uppercase"
              />
              @if (benForm.get('codigo')?.touched && benForm.get('codigo')?.invalid) {
                <p class="text-[11px] text-red-600 mt-1 font-semibold">El código estudiantil es obligatorio.</p>
              }
            </div>

            <!-- Nombre Completo -->
            <div>
              <label for="benNombre" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nombre Completo *
              </label>
              <input
                id="benNombre"
                type="text"
                formControlName="nombre"
                placeholder="Ej: JUAN PABLO GIRALDO RAMÍREZ"
                class="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold uppercase text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              @if (benForm.get('nombre')?.touched && benForm.get('nombre')?.invalid) {
                <p class="text-[11px] text-red-600 mt-1 font-semibold">El nombre completo es obligatorio.</p>
              }
            </div>

            <!-- Género & Tipo Subsidio en 2 columnas -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="benGenero" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Género
                </label>
                <select
                  id="benGenero"
                  formControlName="genero"
                  class="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                </select>
              </div>

              <div>
                <label for="benSubsidio" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Subsidio Asignado
                </label>
                <select
                  id="benSubsidio"
                  formControlName="subsidio"
                  class="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Almuerzo">Almuerzo Diurno</option>
                  <option value="Refrigerio">Refrigerio Noche</option>
                  <option value="Ambos">Ambos Subsidios</option>
                </select>
              </div>
            </div>

            <!-- Programa Académico -->
            <div>
              <label for="benCarrera" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Programa Académico (Carrera) *
              </label>
              <select
                id="benCarrera"
                formControlName="carrera"
                class="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                @for (c of carrerasList; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
            </div>
          </form>

          <!-- Footer Actions -->
          <div class="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="onClose()"
              class="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="benForm.invalid"
              class="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <mat-icon class="text-sm">save</mat-icon>
              <span>Guardar en Padrón</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalNuevoBeneficiario {
  private cafeteria = inject(CafeteriaService);

  isOpen = input<boolean>(false);
  modalClose = output<void>();

  readonly carrerasList = CARRERAS_REGISTRADAS;

  benForm = new FormGroup({
    codigo: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4)], nonNullable: true }),
    nombre: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(3)], nonNullable: true }),
    genero: new FormControl<Genero>('Hombre', { nonNullable: true }),
    carrera: new FormControl<string>('INGENIERÍA DE SISTEMAS', { validators: [Validators.required], nonNullable: true }),
    subsidio: new FormControl<TipoSubsidio>('Almuerzo', { nonNullable: true })
  });

  onClose(): void {
    this.benForm.reset({
      codigo: '',
      nombre: '',
      genero: 'Hombre',
      carrera: 'INGENIERÍA DE SISTEMAS',
      subsidio: 'Almuerzo'
    });
    this.modalClose.emit();
  }

  onSubmit(): void {
    if (this.benForm.invalid) return;

    const val = this.benForm.getRawValue();
    const newBeneficiario: Beneficiario = {
      codigo: val.codigo.trim(),
      nombre: val.nombre.trim().toUpperCase(),
      genero: val.genero,
      carrera: val.carrera,
      subsidio: val.subsidio,
      activo: true,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    this.cafeteria.agregarBeneficiario(newBeneficiario);
    this.onClose();
  }
}
