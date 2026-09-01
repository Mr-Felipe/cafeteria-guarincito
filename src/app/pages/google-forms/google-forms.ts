import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CafeteriaService } from '../../services/cafeteria';
import { FormularioConfig } from '../../models/cafeteria.models';
import { ModalPegarRespuestas } from '../../components/modal-pegar-respuestas/modal-pegar-respuestas';

@Component({
  selector: 'app-google-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, ModalPegarRespuestas],
  template: `
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            Google Workspace & Sheets
          </span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sincronización con Google Forms & Google Sheets
          </h2>
          <p class="text-sm text-slate-600">
            Conexión en tiempo real con <strong>libros de respuestas</strong> de Google Forms para optimizar inventario y evitar desperdicio.
          </p>
        </div>

        <!-- Header Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          @if (cafeteria.isGoogleConnected()) {
            <div class="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-semibold shadow-xs">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="truncate max-w-[180px]">{{ cafeteria.userEmail() }}</span>
            </div>
          } @else {
            <button
              type="button"
              (click)="cafeteria.toggleGoogleConnection()"
              class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <!-- Google 4-Color SVG Icon -->
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Conectar Cuenta Google</span>
            </button>
          }

          <button
            type="button"
            (click)="modalPegarOpen.set(true)"
            class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <mat-icon class="text-base text-slate-500">content_paste</mat-icon>
            <span>Pegar Texto</span>
          </button>
        </div>
      </div>

      <!-- SECCIÓN PRINCIPAL: LIBRO MAESTRO CENTRALIZADO -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white rounded-xl shadow-md p-5 sm:p-6 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                Arquitectura Centralizada Recomendada
              </span>
              @if (cafeteria.urlLibroMaestro()) {
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Conectado
                </span>
              }
            </div>
            <h3 class="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <mat-icon class="text-blue-400">auto_stories</mat-icon>
              Libro Maestro de Google Sheets
            </h3>
            <p class="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Tener un <strong>tercer libro maestro</strong> centraliza la lista completa de beneficiarios, el registro de entregas y los enlaces a los formularios de respuesta. Cualquier cambio se reflejará automáticamente en todos los dispositivos.
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              (click)="onSaveAndSyncLibroMaestro()"
              [disabled]="cafeteria.isSyncing()"
              class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <mat-icon [class.animate-spin]="cafeteria.isSyncing()" class="text-base">sync</mat-icon>
              <span>{{ cafeteria.isSyncing() ? 'Sincronizando Maestro...' : 'Sincronizar Libro Maestro' }}</span>
            </button>
          </div>
        </div>

        <!-- Input URL Libro Maestro -->
        <div class="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 sm:p-4">
          <label for="url-maestro-input" class="block text-xs font-semibold text-slate-300 mb-1.5">
            URL o Enlace de Compartir del Libro Maestro (Google Sheets)
          </label>
          <div class="flex flex-col sm:flex-row items-stretch gap-2">
            <div class="relative flex-1">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <mat-icon class="text-base">link</mat-icon>
              </span>
              <input
                id="url-maestro-input"
                type="text"
                [value]="inputLibroMaestro()"
                (input)="inputLibroMaestro.set($any($event.target).value)"
                placeholder="https://docs.google.com/spreadsheets/d/TU_ID_LIBRO_MAESTRO/edit?usp=sharing"
                class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              (click)="onSaveAndSyncLibroMaestro()"
              class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Guardar y Conectar
            </button>
          </div>
          @if (cafeteria.urlLibroMaestro()) {
            <div class="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <mat-icon class="text-xs text-emerald-400">check</mat-icon>
              <span>Libro maestro activo guardado en este navegador.</span>
            </div>
          }
        </div>
      </div>

      <!-- SINCRONIZADOR DE ARCHIVO CSV / TSV -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <!-- Sección Izquierda: Selector de Subsidio & Descripción -->
          <div class="md:col-span-6 space-y-3">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <mat-icon class="text-lg">cloud_sync</mat-icon>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">Carga o Importación Manual de Respuestas</h3>
                <p class="text-xs text-slate-500">Sube el archivo CSV descargado de Google Sheets</p>
              </div>
            </div>

            <!-- Selector de tipo de subsidio -->
            <div>
              <span class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Destino del Subsidio
              </span>
              <div class="flex flex-wrap items-center gap-2">
                <label 
                  for="upload-auto"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors"
                  [class.bg-blue-50]="uploadSubsidio() === 'Auto'"
                  [class.border-blue-300]="uploadSubsidio() === 'Auto'"
                  [class.text-blue-900]="uploadSubsidio() === 'Auto'"
                  [class.bg-white]="uploadSubsidio() !== 'Auto'"
                  [class.border-slate-200]="uploadSubsidio() !== 'Auto'"
                  [class.text-slate-700]="uploadSubsidio() !== 'Auto'"
                >
                  <input id="upload-auto" type="radio" name="uploadSubsidio" value="Auto" [checked]="uploadSubsidio() === 'Auto'" (change)="uploadSubsidio.set('Auto')" class="accent-blue-600" />
                  <span>Auto-detectar</span>
                </label>

                <label 
                  for="upload-alm"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors"
                  [class.bg-emerald-50]="uploadSubsidio() === 'Almuerzo'"
                  [class.border-emerald-300]="uploadSubsidio() === 'Almuerzo'"
                  [class.text-emerald-900]="uploadSubsidio() === 'Almuerzo'"
                  [class.bg-white]="uploadSubsidio() !== 'Almuerzo'"
                  [class.border-slate-200]="uploadSubsidio() !== 'Almuerzo'"
                  [class.text-slate-700]="uploadSubsidio() !== 'Almuerzo'"
                >
                  <input id="upload-alm" type="radio" name="uploadSubsidio" value="Almuerzo" [checked]="uploadSubsidio() === 'Almuerzo'" (change)="uploadSubsidio.set('Almuerzo')" class="accent-emerald-600" />
                  <span>Almuerzo</span>
                </label>

                <label 
                  for="upload-ref"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors"
                  [class.bg-blue-50]="uploadSubsidio() === 'Refrigerio'"
                  [class.border-blue-300]="uploadSubsidio() === 'Refrigerio'"
                  [class.text-blue-900]="uploadSubsidio() === 'Refrigerio'"
                  [class.bg-white]="uploadSubsidio() !== 'Refrigerio'"
                  [class.border-slate-200]="uploadSubsidio() !== 'Refrigerio'"
                  [class.text-slate-700]="uploadSubsidio() !== 'Refrigerio'"
                >
                  <input id="upload-ref" type="radio" name="uploadSubsidio" value="Refrigerio" [checked]="uploadSubsidio() === 'Refrigerio'" (change)="uploadSubsidio.set('Refrigerio')" class="accent-blue-600" />
                  <span>Refrigerio</span>
                </label>
              </div>
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
                accept=".csv,.tsv,.txt"
                (change)="onFileSelected($event)"
                class="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <mat-icon class="text-xl">cloud_upload</mat-icon>
              </div>
              <div>
                <p class="text-xs sm:text-sm font-bold text-slate-900">
                  Subir CSV de Google Sheets
                </p>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  Arrastra tu archivo aquí o haz clic para seleccionarlo
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback de Carga CSV -->
        @if (csvFeedback()) {
          <div 
            class="p-3.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in"
            [class.bg-emerald-50]="csvFeedback()?.type === 'success'"
            [class.text-emerald-900]="csvFeedback()?.type === 'success'"
            [class.border]="true"
            [class.border-emerald-200]="csvFeedback()?.type === 'success'"
            [class.bg-red-50]="csvFeedback()?.type === 'error'"
            [class.text-red-900]="csvFeedback()?.type === 'error'"
            [class.border-red-200]="csvFeedback()?.type === 'error'"
          >
            <div class="flex items-center gap-2">
              <mat-icon class="text-base">{{ csvFeedback()?.type === 'success' ? 'check_circle' : 'error' }}</mat-icon>
              <span>{{ csvFeedback()?.text }}</span>
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

      <!-- TARJETAS DE LOS 2 FORMULARIOS OFICIALES (GRID 2 COLS) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- FORMULARIO 1: ALMUERZO DIURNO -->
        @let formAlm = getFormAlmuerzo();
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <!-- Top Accent Bar -->
            <div class="h-1 bg-emerald-500"></div>

            <div class="p-5 space-y-4">
              <!-- Card Header -->
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-1">
                    <mat-icon class="text-xs">wb_sunny</mat-icon>
                    Almuerzo
                  </span>
                  <h3 class="text-base font-bold text-slate-900">{{ formAlm.nombre }}</h3>
                  <p class="text-xs text-slate-500">Horario: <strong class="text-slate-700">{{ formAlm.horario }}</strong></p>
                </div>

                <div class="text-right">
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs font-semibold text-slate-700 border border-slate-200">
                    {{ formAlm.totalRespuestasSincronizadas || 0 }} resp
                  </span>
                </div>
              </div>

              <!-- Info Box -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">ID Formulario:</span>
                  <span class="font-mono font-bold text-slate-800">{{ formAlm.id }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Carreras autorizadas:</span>
                  <span class="font-semibold text-emerald-800">9 Programas Diurnos</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Campos del Formulario:</span>
                  <span class="text-slate-700 text-[11px]">{{ formAlm.campos }}</span>
                </div>
              </div>

              <!-- Zona de Sync en Vivo -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <mat-icon class="text-sm text-slate-500">link</mat-icon>
                    URL de Google Sheets (Publicada en CSV)
                  </span>
                  <span class="text-[10px] text-slate-500 font-semibold">
                    {{ formAlm.ultimaSincronizacion || 'Sin sincronizar' }}
                  </span>
                </div>

                <div class="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    [value]="formAlmUrl()"
                    (input)="formAlmUrl.set($any($event.target).value)"
                    placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                    class="flex-1 p-2 font-mono text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    (click)="onSaveAndSyncForm(formAlm.id, formAlmUrl())"
                    [disabled]="cafeteria.isSyncing()"
                    class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <mat-icon class="text-sm" [class.animate-spin]="cafeteria.isSyncing()">sync</mat-icon>
                    <span>Guardar y Sincronizar</span>
                  </button>
                </div>

                <p class="text-[11px] text-slate-500 leading-relaxed">
                  Para actualizar en tiempo real: en Google Sheets ve a <strong>Archivo &gt; Compartir &gt; Publicar en la web</strong>, selecciona formato CSV y pega el enlace.
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              (click)="copyStudentLink(formAlm.urlForm)"
              class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <mat-icon class="text-sm">share</mat-icon>
              <span>Copiar Link Estudiantes</span>
            </button>

            <div class="flex items-center gap-2">
              <a
                [href]="formAlm.urlForm"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <mat-icon class="text-sm">edit</mat-icon>
                <span>Editar en Forms</span>
              </a>

              <a
                [href]="formAlm.urlForm"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <mat-icon class="text-sm">visibility</mat-icon>
                <span>Ver Formulario</span>
              </a>
            </div>
          </div>
        </div>

        <!-- FORMULARIO 2: REFRIGERIO NOCHE -->
        @let formRef = getFormRefrigerio();
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <!-- Top Accent Bar -->
            <div class="h-1 bg-blue-600"></div>

            <div class="p-5 space-y-4">
              <!-- Card Header -->
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-1">
                    <mat-icon class="text-xs">nights_stay</mat-icon>
                    Refrigerio
                  </span>
                  <h3 class="text-base font-bold text-slate-900">{{ formRef.nombre }}</h3>
                  <p class="text-xs text-slate-500">Horario: <strong class="text-slate-700">{{ formRef.horario }}</strong></p>
                </div>

                <div class="text-right">
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs font-semibold text-slate-700 border border-slate-200">
                    {{ formRef.totalRespuestasSincronizadas || 0 }} resp
                  </span>
                </div>
              </div>

              <!-- Info Box -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">ID Formulario:</span>
                  <span class="font-mono font-bold text-slate-800">{{ formRef.id }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Carreras autorizadas:</span>
                  <span class="font-semibold text-blue-800">ADMON FINANCIERA · TRABAJO SOCIAL</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Campos del Formulario:</span>
                  <span class="text-slate-700 text-[11px]">{{ formRef.campos }}</span>
                </div>
              </div>

              <!-- Zona de Sync en Vivo -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <mat-icon class="text-sm text-slate-500">link</mat-icon>
                    URL de Google Sheets (Publicada en CSV)
                  </span>
                  <span class="text-[10px] text-slate-500 font-semibold">
                    {{ formRef.ultimaSincronizacion || 'Sin sincronizar' }}
                  </span>
                </div>

                <div class="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    [value]="formRefUrl()"
                    (input)="formRefUrl.set($any($event.target).value)"
                    placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                    class="flex-1 p-2 font-mono text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    (click)="onSaveAndSyncForm(formRef.id, formRefUrl())"
                    [disabled]="cafeteria.isSyncing()"
                    class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <mat-icon class="text-sm" [class.animate-spin]="cafeteria.isSyncing()">sync</mat-icon>
                    <span>Guardar y Sincronizar</span>
                  </button>
                </div>

                <p class="text-[11px] text-slate-500 leading-relaxed">
                  Para actualizar en tiempo real: en Google Sheets ve a <strong>Archivo &gt; Compartir &gt; Publicar en la web</strong>, selecciona formato CSV y pega el enlace.
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              (click)="copyStudentLink(formRef.urlForm)"
              class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <mat-icon class="text-sm">share</mat-icon>
              <span>Copiar Link Estudiantes</span>
            </button>

            <div class="flex items-center gap-2">
              <a
                [href]="formRef.urlForm"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <mat-icon class="text-sm">edit</mat-icon>
                <span>Editar en Forms</span>
              </a>

              <a
                [href]="formRef.urlForm"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <mat-icon class="text-sm">visibility</mat-icon>
                <span>Ver Formulario</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <!-- SECCIÓN DIDÁCTICA: CÓMO CREAR LAS HOJAS DE BENEFICIARIOS, CARRERAS Y TIPO DE SUBSIDIO EN GOOGLE SHEETS -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">table_chart</mat-icon>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">
                Estructura de Hojas Recomendada en tus Google Sheets
              </h3>
              <p class="text-xs text-slate-500">
                Puedes agregar pestañas secundarias haciendo clic en el botón <strong>"+"</strong> (Añadir hoja) en la esquina inferior izquierda de tu libro de Google Sheets.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="modalScriptOpen.set(true)"
              class="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <mat-icon class="text-sm">code</mat-icon>
              <span>Automatizar con Google Apps Script</span>
            </button>

            <button
              type="button"
              (click)="cafeteria.descargarPlantillaGoogleSheets()"
              class="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <mat-icon class="text-sm">download</mat-icon>
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>
        </div>

        <!-- Feedback Toast when copied -->
        @if (copyMessage()) {
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 flex items-center justify-between animate-fade-in">
            <div class="flex items-center gap-2">
              <mat-icon class="text-base text-emerald-600">check_circle</mat-icon>
              <span>{{ copyMessage() }}</span>
            </div>
            <button type="button" (click)="copyMessage.set(null)" class="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>
        }

        <!-- Tarjetas con las 5 Hojas / Pestañas del Libro Maestro -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- HOJA 1: BENEFICIARIOS -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  Pestaña 1
                </span>
                <span class="text-[10px] text-slate-400 font-mono">Nombre: "Beneficiarios"</span>
              </div>
              <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <mat-icon class="text-base text-blue-600">badge</mat-icon>
                Padrón de Beneficiarios
              </h4>
              <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Padrón completo de estudiantes autorizados con subsidio (iVMS-4200).
              </p>
              <div class="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700">
                <strong>Columnas:</strong><br/>
                Código ID | Nombre Completo | Género | Carrera | Tipo Subsidio | Activo
              </div>
            </div>

            <button
              type="button"
              (click)="copyBeneficiariosTemplate()"
              class="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <mat-icon class="text-sm text-slate-600">content_copy</mat-icon>
              <span>Copiar Padrón para Pegar</span>
            </button>
          </div>

          <!-- HOJA 2: FORMULARIOS & LINKS -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                  Pestaña 2
                </span>
                <span class="text-[10px] text-slate-400 font-mono">Nombre: "Formularios_Links"</span>
              </div>
              <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <mat-icon class="text-base text-amber-600">dynamic_form</mat-icon>
                Links de Formularios
              </h4>
              <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Centraliza las URLs de los Google Sheets de respuestas para que cualquier dispositivo se conecte.
              </p>
              <div class="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700">
                <strong>Columnas:</strong><br/>
                ID_Formulario | Nombre_Servicio | Tipo_Subsidio | URL_Google_Sheet | Horario
              </div>
            </div>

            <button
              type="button"
              (click)="copyFormulariosLinksTemplate()"
              class="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <mat-icon class="text-sm text-slate-600">content_copy</mat-icon>
              <span>Copiar Enlaces de Formularios</span>
            </button>
          </div>

          <!-- HOJA 3: ENTREGAS / HISTORIAL -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Pestaña 3
                </span>
                <span class="text-[10px] text-slate-400 font-mono">Nombre: "Entregas_Registro"</span>
              </div>
              <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <mat-icon class="text-base text-emerald-600">fact_check</mat-icon>
                Registro de Entregas
              </h4>
              <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Historial de raciones entregadas/reclamadas en comedor con marca de hora.
              </p>
              <div class="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700">
                <strong>Columnas:</strong><br/>
                Fecha | Hora_Entrega | Código_ID | Nombre | Carrera | Estado | Observaciones
              </div>
            </div>

            <button
              type="button"
              (click)="copyEntregasTemplate()"
              class="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <mat-icon class="text-sm text-slate-600">content_copy</mat-icon>
              <span>Copiar Estructura de Entregas</span>
            </button>
          </div>

          <!-- HOJA 4: CARRERAS -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                  Pestaña 4
                </span>
                <span class="text-[10px] text-slate-400 font-mono">Nombre: "Carreras"</span>
              </div>
              <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <mat-icon class="text-base text-purple-600">school</mat-icon>
                Catálogo de Carreras
              </h4>
              <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Los 11 programas académicos oficiales para validaciones y listas desplegables.
              </p>
              <div class="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700">
                <strong>Columnas:</strong><br/>
                ID | Nombre del Programa | Jornada (Diurna / Nocturna)
              </div>
            </div>

            <button
              type="button"
              (click)="copyCarrerasTemplate()"
              class="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <mat-icon class="text-sm text-slate-600">content_copy</mat-icon>
              <span>Copiar Lista de 11 Carreras</span>
            </button>
          </div>

          <!-- HOJA 5: TIPO DE SUBSIDIO -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                  Pestaña 5
                </span>
                <span class="text-[10px] text-slate-400 font-mono">Nombre: "TipoSubsidio"</span>
              </div>
              <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <mat-icon class="text-base text-teal-600">restaurant</mat-icon>
                Tipos de Subsidio
              </h4>
              <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Clasificación de subsidios con sus franjas horarias y requisitos por jornada.
              </p>
              <div class="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700">
                <strong>Opciones válidas:</strong><br/>
                1. Almuerzo (Diurno)<br/>
                2. Refrigerio (Nocturno)<br/>
                3. Ambos
              </div>
            </div>

            <button
              type="button"
              (click)="copySubsidiosTemplate()"
              class="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <mat-icon class="text-sm text-slate-600">content_copy</mat-icon>
              <span>Copiar Tipos de Subsidio</span>
            </button>
          </div>
        </div>
      </div>
    <!-- MODAL GOOGLE APPS SCRIPT -->
    @if (modalScriptOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-800/40">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30 font-bold">
                <mat-icon class="text-lg">terminal</mat-icon>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">Script Automatizado de Google Apps Script</h3>
                <p class="text-[11px] text-indigo-200">Crea todas las pestañas y sincroniza respuestas con 1 solo clic en Google Sheets</p>
              </div>
            </div>
            <button
              type="button"
              (click)="modalScriptOpen.set(false)"
              class="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <mat-icon class="text-xl">close</mat-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
            <!-- Pasos rápidos -->
            <div class="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2">
              <h4 class="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                <mat-icon class="text-base text-indigo-600">tips_and_updates</mat-icon>
                ¿Cómo usar este Script en tu Libro de Google Sheets?
              </h4>
              <ol class="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                <li>Abre tu hoja de cálculo nueva en Google Sheets: <strong>Cafeteria_Guarincito_Libro_Maestro</strong>.</li>
                <li>En el menú superior, ve a <strong>Extensiones</strong> &gt; <strong>Apps Script</strong>.</li>
                <li>Borra cualquier código que aparezca en el editor y <strong>pega el código que está abajo</strong>.</li>
                <li>Haz clic en el icono de <strong>Guardar</strong> (el disco 💾).</li>
                <li>En el selector de funciones, elige <strong><code>inicializarLibroMaestro</code></strong> y haz clic en <strong>Ejecutar</strong>.</li>
                <li>¡Listo! Se crearán automáticamente las 5 pestañas formateadas y aparecerá un menú <strong>🍽️ Cafetería Guarincito</strong> en tu hoja.</li>
              </ol>
            </div>

            <!-- Código Apps Script con botón de copiado -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-900">Código JavaScript (Apps Script):</span>
                <button
                  type="button"
                  (click)="copiarCodigoAppsScript()"
                  class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <mat-icon class="text-sm">content_copy</mat-icon>
                  <span>{{ scriptCopied() ? '¡Código Copiado!' : 'Copiar Código Completo' }}</span>
                </button>
              </div>
              <pre class="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800 leading-relaxed">{{ cafeteria.getGoogleAppsScriptCodigo() }}</pre>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span class="text-[11px] text-slate-500">Totalmente compatible con los Google Forms de Almuerzo y Refrigerio.</span>
            <button
              type="button"
              (click)="modalScriptOpen.set(false)"
              class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    }

    <app-modal-pegar-respuestas
      [isOpen]="modalPegarOpen()"
      (modalClose)="modalPegarOpen.set(false)"
    />
  `
})
export class GoogleForms implements OnInit {
  readonly cafeteria = inject(CafeteriaService);

  modalPegarOpen = signal<boolean>(false);
  modalScriptOpen = signal<boolean>(false);
  scriptCopied = signal<boolean>(false);
  uploadSubsidio = signal<'Auto' | 'Almuerzo' | 'Refrigerio' | 'Desayuno'>('Auto');
  csvFeedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  copyMessage = signal<string | null>(null);

  formAlmUrl = signal<string>('');
  formRefUrl = signal<string>('');
  inputLibroMaestro = signal<string>('');

  ngOnInit(): void {
    const alm = this.getFormAlmuerzo();
    const ref = this.getFormRefrigerio();
    this.formAlmUrl.set(alm.urlSheet);
    this.formRefUrl.set(ref.urlSheet);
    this.inputLibroMaestro.set(this.cafeteria.urlLibroMaestro());
  }

  async onSaveAndSyncLibroMaestro(): Promise<void> {
    const url = this.inputLibroMaestro().trim();
    if (!url) {
      this.copyMessage.set('Por favor introduce una URL válida de tu Libro Maestro de Google Sheets.');
      setTimeout(() => this.copyMessage.set(null), 4000);
      return;
    }
    const res = await this.cafeteria.sincronizarTodoLibroMaestro(url);
    if (res.success) {
      this.copyMessage.set(res.message);
      setTimeout(() => this.copyMessage.set(null), 5000);
    }
  }

  getFormAlmuerzo(): FormularioConfig {
    const found = this.cafeteria.formularios().find(f => f.tipo === 'Almuerzo');
    return found || {
      id: 'almuerzo-diurno',
      nombre: 'Confirmación Almuerzo Diurno',
      tipo: 'Almuerzo',
      urlSheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_DEMO_ALMUERZO/pub?output=csv',
      urlForm: 'https://forms.gle/almuerzo-demo',
      horario: '5:00 AM a 10:00 AM',
      carrerasDescripcion: '9 Programas Diurnos',
      campos: 'Marca temporal · Carrera · Código ID · Nombre',
      activo: true
    };
  }

  getFormRefrigerio(): FormularioConfig {
    const found = this.cafeteria.formularios().find(f => f.tipo === 'Refrigerio');
    return found || {
      id: 'refrigerio-noche',
      nombre: 'Confirmación Refrigerio Noche',
      tipo: 'Refrigerio',
      urlSheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_DEMO_REFRIGERIO/pub?output=csv',
      urlForm: 'https://forms.gle/refrigerio-demo',
      horario: '2:00 PM a 7:00 PM',
      carrerasDescripcion: 'ADMON FINANCIERA · TRABAJO SOCIAL',
      campos: 'Marca temporal · Carrera · Código ID · Nombre',
      activo: true
    };
  }

  onSaveAndSyncForm(formId: string, url: string): void {
    const existing = this.cafeteria.formularios().find(f => f.id === formId);
    if (existing) {
      const updated: FormularioConfig = {
        ...existing,
        urlSheet: url.trim()
      };
      this.cafeteria.guardarFormularioConfig(updated);
      this.cafeteria.sincronizarConGoogleSheets(formId);
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
      this.processFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const res = this.cafeteria.importarConfirmacionesCSV(text, this.uploadSubsidio());
        if (res.total > 0) {
          this.csvFeedback.set({
            type: 'success',
            text: `¡Archivo procesado con éxito! Se cargaron ${res.total} registros (${res.nuevos} nuevas confirmaciones).`
          });
        } else {
          this.csvFeedback.set({
            type: 'error',
            text: 'No se encontraron registros legibles en el archivo proporcionado.'
          });
        }
      }
    };
    reader.readAsText(file);
  }

  copyStudentLink(url: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      this.copyMessage.set('¡Enlace del formulario copiado al portapapeles!');
      setTimeout(() => this.copyMessage.set(null), 4000);
    }
  }

  copyBeneficiariosTemplate(): void {
    const text = this.cafeteria.getPlantillaBeneficiariosTexto();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.copyMessage.set('¡Estructura de Beneficiarios copiada! Abre tu Google Sheet, crea una pestaña llamada "Beneficiarios" y pega con Ctrl+V.');
      setTimeout(() => this.copyMessage.set(null), 6000);
    }
  }

  copyFormulariosLinksTemplate(): void {
    const text = this.cafeteria.getPlantillaFormulariosLinksTexto();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.copyMessage.set('¡Estructura de Formularios & Links copiada! Pégala en tu pestaña "Formularios_Links" de tu Libro Maestro.');
      setTimeout(() => this.copyMessage.set(null), 6000);
    }
  }

  copyEntregasTemplate(): void {
    const text = this.cafeteria.getPlantillaEntregasTexto();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.copyMessage.set('¡Estructura de Registro de Entregas copiada! Pégala en tu pestaña "Entregas_Registro".');
      setTimeout(() => this.copyMessage.set(null), 6000);
    }
  }

  copyCarrerasTemplate(): void {
    const text = this.cafeteria.getPlantillaCarrerasTexto();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.copyMessage.set('¡Catálogo de 11 Carreras copiado! Pégalo en una pestaña llamada "Carreras" en tu Google Sheet.');
      setTimeout(() => this.copyMessage.set(null), 6000);
    }
  }

  copySubsidiosTemplate(): void {
    const text = this.cafeteria.getPlantillaSubsidiosTexto();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.copyMessage.set('¡Tipos de Subsidio copiados! Pégalos en tu pestaña "TipoSubsidio".');
      setTimeout(() => this.copyMessage.set(null), 6000);
    }
  }

  copiarCodigoAppsScript(): void {
    const text = this.cafeteria.getGoogleAppsScriptCodigo();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.scriptCopied.set(true);
      this.copyMessage.set('¡Código de Apps Script copiado! Pégalo en Extensiones > Apps Script de tu Google Sheet.');
      setTimeout(() => {
        this.scriptCopied.set(false);
        this.copyMessage.set(null);
      }, 5000);
    }
  }
}
