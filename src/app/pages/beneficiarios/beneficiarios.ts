import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CafeteriaService } from '../../services/cafeteria';
import { Beneficiario, CARRERAS_REGISTRADAS, getVisualCarrera } from '../../models/cafeteria.models';
import { ModalNuevoBeneficiario } from '../../components/modal-nuevo-beneficiario/modal-nuevo-beneficiario';

@Component({
  selector: 'app-beneficiarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, ModalNuevoBeneficiario],
  template: `
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            Padrón Oficial de Beneficiarios
          </span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Padrón de Beneficiarios · iVMS-4200 (Hikvision)
          </h2>
          <p class="text-sm text-slate-600">
            Padrón institucional de estudiantes con subsidio alimentario activo para contrastar con las confirmaciones de Google Forms.
          </p>
        </div>

        <!-- Header Actions -->
        <div class="flex flex-wrap items-center gap-2">
          @if (cafeteria.urlLibroMaestro()) {
            <button
              type="button"
              (click)="onSincronizarMaestro()"
              [disabled]="cafeteria.isSyncing() || syncingMaestro()"
              class="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <mat-icon [class.animate-spin]="syncingMaestro()" class="text-base text-blue-600">sync</mat-icon>
              <span>{{ syncingMaestro() ? 'Sincronizando...' : 'Sincronizar con Libro Maestro' }}</span>
            </button>
          }

          <!-- Descargar Plantilla CSV para Google Sheets -->
          <button
            type="button"
            (click)="cafeteria.descargarPlantillaGoogleSheets()"
            class="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <mat-icon class="text-base text-emerald-600">table_view</mat-icon>
            <span>Plantilla para Google Sheets</span>
          </button>

          <!-- Vaciar Padrón -->
          <button
            type="button"
            (click)="onVaciarPadron()"
            class="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <mat-icon class="text-base">delete_sweep</mat-icon>
            <span>Vaciar Padrón ({{ cafeteria.beneficiarios().length }})</span>
          </button>

          <!-- Nuevo Beneficiario -->
          <button
            type="button"
            (click)="modalNuevoOpen.set(true)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <mat-icon class="text-base">person_add</mat-icon>
            <span>Nuevo Beneficiario</span>
          </button>
        </div>
      </div>

      <!-- ZONA DE CARGA CSV (iVMS-4200) -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <!-- Sección Izquierda: Descripción del Formato iVMS -->
          <div class="md:col-span-6 space-y-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-semibold uppercase tracking-wider">
              <mat-icon class="text-xs">upload_file</mat-icon>
              Carga Masiva de Archivo CSV (Exportación iVMS-4200)
            </span>
            <h3 class="text-base font-bold text-slate-900">
              Importar base de datos institucional
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Carga el listado exportado del control de acceso Hikvision iVMS-4200 o plantilla Excel institucional.
            </p>
            <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-mono">
              Estructura esperada: <code class="font-bold text-slate-900">Código;Nombre;Género;Carrera;Subsidio</code>
            </div>
          </div>

          <!-- Sección Derecha: Drag & Drop Zone -->
          <div class="md:col-span-6">
            <div
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onFileDrop($event)"
              class="relative border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 transition-colors rounded-xl p-4 sm:p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <input
                type="file"
                accept=".csv,.txt"
                (change)="onFileSelected($event)"
                class="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <mat-icon class="text-xl">file_upload</mat-icon>
              </div>
              <div>
                <p class="text-xs sm:text-sm font-bold text-slate-900">
                  Arrastra o selecciona el CSV
                </p>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  Soporta CSV separado por comas o punto y coma (;)
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback de Importación -->
        @if (csvFeedback()) {
          <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 flex items-center justify-between gap-3 animate-fade-in">
            <div class="flex items-center gap-2">
              <mat-icon class="text-base text-emerald-700">check_circle</mat-icon>
              <span>{{ csvFeedback() }}</span>
            </div>
            <button
              type="button"
              (click)="csvFeedback.set(null)"
              class="text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>
        }
      </div>

      <!-- TABLA DEL PADRÓN -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <!-- Header de Filtros de la Tabla -->
        <div class="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-bold text-slate-900">Estudiantes en el Padrón Activo</h3>
            <p class="text-xs text-slate-500">
              Mostrando <strong class="text-slate-900">{{ beneficiariosFiltrados().length }}</strong> de <strong class="text-slate-900">{{ cafeteria.beneficiarios().length }}</strong> registrados
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Search input -->
            <div class="relative w-full sm:w-64">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</mat-icon>
              <input
                type="text"
                [value]="searchQuery()"
                (input)="searchQuery.set($any($event.target).value)"
                placeholder="Buscar código o nombre..."
                class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <!-- Carrera Filter -->
            <select
              [value]="selectedCarrera()"
              (change)="selectedCarrera.set($any($event.target).value)"
              class="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="TODAS">TODAS LAS CARRERAS</option>
              @for (c of carrerasList(); track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Tabla Responsive -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
                <th class="p-3.5 pl-6 cursor-pointer hover:bg-slate-100 select-none transition-colors" (click)="onSort('codigo')">
                  <span class="flex items-center gap-1">Código ID <span class="text-[9px] text-slate-400">{{ sortIcon('codigo') }}</span></span>
                </th>
                <th class="p-3.5 cursor-pointer hover:bg-slate-100 select-none transition-colors" (click)="onSort('nombre')">
                  <span class="flex items-center gap-1">Nombre Completo <span class="text-[9px] text-slate-400">{{ sortIcon('nombre') }}</span></span>
                </th>
                <th class="p-3.5 text-center cursor-pointer hover:bg-slate-100 select-none transition-colors" (click)="onSort('genero')">
                  <span class="flex items-center gap-1 justify-center">Género <span class="text-[9px] text-slate-400">{{ sortIcon('genero') }}</span></span>
                </th>
                <th class="p-3.5 cursor-pointer hover:bg-slate-100 select-none transition-colors" (click)="onSort('carrera')">
                  <span class="flex items-center gap-1">Programa Académico <span class="text-[9px] text-slate-400">{{ sortIcon('carrera') }}</span></span>
                </th>
                <th class="p-3.5 text-center cursor-pointer hover:bg-slate-100 select-none transition-colors" (click)="onSort('subsidio')">
                  <span class="flex items-center gap-1 justify-center">Subsidio Asignado <span class="text-[9px] text-slate-400">{{ sortIcon('subsidio') }}</span></span>
                </th>
                <th class="p-3.5 text-center cursor-pointer hover:bg-slate-100 select-none transition-colors" (click)="onSort('activo')">
                  <span class="flex items-center gap-1 justify-center">Estado <span class="text-[9px] text-slate-400">{{ sortIcon('activo') }}</span></span>
                </th>
                <th class="p-3.5 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (b of beneficiariosFiltrados(); track b.codigo) {
                @let visual = getVisual(b.carrera);
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <!-- Código -->
                  <td class="p-3.5 pl-6 font-mono font-bold text-slate-900">
                    <span class="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {{ b.codigo }}
                    </span>
                  </td>

                  <!-- Nombre -->
                  <td class="p-3.5 font-semibold text-slate-900">
                    {{ b.nombre }}
                  </td>

                  <!-- Género -->
                  <td class="p-3.5 text-center">
                    @if (b.genero === 'Hombre') {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 border border-blue-200 text-blue-800">
                        <mat-icon class="text-[12px]">male</mat-icon>
                        Hombre
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-50 border border-pink-200 text-pink-800">
                        <mat-icon class="text-[12px]">female</mat-icon>
                        Mujer
                      </span>
                    }
                  </td>

                  <!-- Carrera -->
                  <td class="p-3.5">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold {{ visual.badgeClass }}">
                      <mat-icon class="text-xs">{{ visual.icono }}</mat-icon>
                      <span class="truncate max-w-[170px]">{{ b.carrera }}</span>
                    </span>
                  </td>

                  <!-- Subsidio -->
                  <td class="p-3.5 text-center">
                    @if (b.subsidio === 'Almuerzo') {
                      <span class="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        Almuerzo
                      </span>
                    } @else if (b.subsidio === 'Refrigerio') {
                      <span class="font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-[10px]">
                        Refrigerio
                      </span>
                    } @else if (b.subsidio === 'Desayuno') {
                      <span class="font-semibold text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full text-[10px]">
                        Desayuno
                      </span>
                    } @else {
                      <span class="font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-[10px]">
                        Ambos Subsidios
                      </span>
                    }
                  </td>

                  <!-- Estado -->
                  <td class="p-3.5 text-center">
                    <button
                      type="button"
                      (click)="cafeteria.toggleActivoBeneficiario(b.codigo)"
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer"
                      [class.bg-emerald-100]="b.activo"
                      [class.text-emerald-800]="b.activo"
                      [class.bg-slate-200]="!b.activo"
                      [class.text-slate-600]="!b.activo"
                    >
                      {{ b.activo ? 'Activo' : 'Inactivo' }}
                    </button>
                  </td>

                  <!-- Acciones -->
                  <td class="p-3.5 pr-6 text-right">
                    <button
                      type="button"
                      (click)="onDeleteBeneficiario(b)"
                      class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar beneficiario"
                    >
                      <mat-icon class="text-base">delete</mat-icon>
                    </button>
                  </td>
                </tr>
              }

              @if (beneficiariosFiltrados().length === 0) {
                <tr>
                  <td colspan="7" class="p-12 text-center text-slate-500">
                    <mat-icon class="text-5xl text-slate-300 mb-2">person_off</mat-icon>
                    <p class="text-sm font-semibold text-slate-700">No se encontraron beneficiarios en el padrón</p>
                    <p class="text-xs text-slate-400 mt-1">Carga un archivo CSV o utiliza el botón "Nuevo Beneficiario".</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL AGREGAR BENEFICIARIO -->
    <app-modal-nuevo-beneficiario
      [isOpen]="modalNuevoOpen()"
      (modalClose)="modalNuevoOpen.set(false)"
    />
  `
})
export class Beneficiarios {
  readonly cafeteria = inject(CafeteriaService);

  readonly carrerasList = computed(() => {
    const list = this.cafeteria.beneficiarios();
    const carreras = [...new Set(list.map(b => b.carrera).filter(c => c && c !== 'PROGRAMA ACADÉMICO'))];
    return carreras.sort();
  });

  modalNuevoOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedCarrera = signal<string>('TODAS');
  csvFeedback = signal<string | null>(null);
  syncingMaestro = signal<boolean>(false);

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc' | ''>('');

  private readonly sortKeys: Record<string, keyof Beneficiario> = {
    codigo: 'codigo',
    nombre: 'nombre',
    genero: 'genero',
    carrera: 'carrera',
    subsidio: 'subsidio',
    activo: 'activo'
  };

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

  readonly beneficiariosFiltrados = computed(() => {
    const list = this.cafeteria.beneficiarios();
    const query = this.searchQuery().trim().toLowerCase();
    const car = this.selectedCarrera();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    let result = list.filter(b => {
      if (car !== 'TODAS' && b.carrera !== car && !b.carrera.toUpperCase().includes(car.toUpperCase())) {
        return false;
      }
      if (query) {
        const matchCod = b.codigo.toLowerCase().includes(query);
        const matchNom = b.nombre.toLowerCase().includes(query);
        const matchCar = b.carrera.toLowerCase().includes(query);
        if (!matchCod && !matchNom && !matchCar) return false;
      }
      return true;
    });

    if (col && dir) {
      const key = this.sortKeys[col];
      if (key) {
        result = [...result].sort((a, b) => {
          const av = String(a[key]);
          const bv = String(b[key]);
          const cmp = av.localeCompare(bv, 'es', { sensitivity: 'base' });
          return dir === 'asc' ? cmp : -cmp;
        });
      }
    }

    return result;
  });

  getVisual(carrera: string) {
    return getVisualCarrera(carrera);
  }

  async onSincronizarMaestro(): Promise<void> {
    this.syncingMaestro.set(true);
    this.csvFeedback.set('Sincronizando con el Libro Maestro...');
    const res = await this.cafeteria.sincronizarTodoLibroMaestro();
    this.syncingMaestro.set(false);
    if (res.message) {
      this.csvFeedback.set(res.message);
      setTimeout(() => this.csvFeedback.set(null), 8000);
    }
  }

  onDeleteBeneficiario(b: Beneficiario): void {
    if (confirm(`¿Eliminar al estudiante ${b.nombre} (${b.codigo}) del padrón oficial?`)) {
      this.cafeteria.eliminarBeneficiario(b.codigo);
    }
  }

  onVaciarPadron(): void {
    if (confirm('¿Estás seguro de que deseas VACIAR todo el padrón de beneficiarios?')) {
      this.cafeteria.vaciarPadron();
    }
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  onFileDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      this.processCSV(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processCSV(input.files[0]);
    }
  }

  private processCSV(file: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const stats = this.cafeteria.importarBeneficiariosCSV(text);
        this.csvFeedback.set(
          `Carga masiva finalizada: ${stats.inserted} nuevos beneficiarios insertados, ${stats.updated} actualizados, ${stats.errors} filas omitidas.`
        );
      }
    };
    reader.readAsText(file);
  }
}
