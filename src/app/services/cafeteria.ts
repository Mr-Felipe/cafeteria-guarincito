import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  Beneficiario,
  Confirmacion,
  FormularioConfig,
  SubsidioFiltro,
  TipoSubsidio,
  CARRERAS_REGISTRADAS,
  getVisualCarrera
} from '../models/cafeteria.models';

const STORAGE_KEYS = {
  BENEFICIARIOS: 'guarincito_beneficiarios_v2',
  CONFIRMACIONES: 'guarincito_confirmaciones_v2',
  FORMULARIOS: 'guarincito_formularios_v2',
  GOOGLE_CONNECTED: 'guarincito_google_connected_v2',
  LAST_SYNC: 'guarincito_last_sync_v2',
  LIBRO_MAESTRO: 'guarincito_libro_maestro_v2'
};

const SEED_BENEFICIARIOS: Beneficiario[] = [];

const SEED_FORMULARIOS: FormularioConfig[] = [
  {
    id: 'almuerzo-diurno',
    nombre: 'Confirmación Almuerzo Diurno',
    tipo: 'Almuerzo',
    urlSheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHzFv331883MM4x15ug_0IICKleeGQNwv44Sr5cNEa3x46pOKy7UgbENxHo9fXCNrz2L9SqyLePMXz/pubhtml',
    urlForm: 'https://docs.google.com/forms/d/e/1FAIpQLSc-almuerzo-guarincito/viewform',
    horario: '5:00 AM a 10:00 AM',
    carrerasDescripcion: '9 Programas Diurnos (Ingenierías, Derecho, Economía, etc.)',
    campos: 'Marca temporal · Carrera · Código ID · Nombre Completo',
    activo: true,
    ultimaSincronizacion: 'Listo para sincronizar',
    totalRespuestasSincronizadas: 0
  },
  {
    id: 'refrigerio-noche',
    nombre: 'Confirmación Refrigerio Noche',
    tipo: 'Refrigerio',
    urlSheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRYasG_i892iplw8kTyEjGDQI731MmncpRYhKVWDY2vop6KxbEDoEFGQ4AoFe2MboNX4CLWy_GbUoEI/pubhtml',
    urlForm: 'https://docs.google.com/forms/d/e/1FAIpQLSc-refrigerio-guarincito/viewform',
    horario: '2:00 PM a 7:00 PM',
    carrerasDescripcion: 'ADMON FINANCIERA · TRABAJO SOCIAL',
    campos: 'Marca temporal · Carrera · Código ID · Nombre Completo',
    activo: true,
    ultimaSincronizacion: 'Listo para sincronizar',
    totalRespuestasSincronizadas: 0
  },
  {
    id: 'desayuno-domingo',
    nombre: 'Confirmación Desayuno Dominical',
    tipo: 'Desayuno',
    urlSheet: '',
    urlForm: '',
    horario: '7:00 AM a 10:00 AM',
    carrerasDescripcion: 'REGENCIA · TECNICO EN PROCESOS · ADEA',
    campos: 'Marca temporal · Carrera · Código ID · Nombre Completo',
    activo: false,
    ultimaSincronizacion: 'Pendiente - Crear formulario',
    totalRespuestasSincronizadas: 0
  }
];

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwLkpKK2FO2jymgEzLIaFIHdsyv76qe-aeOr9QMt2sa7txrvm48UYL8LXUxGOgdZ0gC9Q/exec';

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Injectable({
  providedIn: 'root'
})
export class CafeteriaService {
  private http = inject(HttpClient);

  // State Signals
  readonly beneficiarios = signal<Beneficiario[]>([]);
  readonly confirmaciones = signal<Confirmacion[]>([]);
  readonly formularios = signal<FormularioConfig[]>([]);
  readonly isSyncing = signal<boolean>(false);
  readonly isGoogleConnected = signal<boolean>(true);
  readonly userEmail = signal<string>('cafeteriaguarinocito@gmail.com');
  readonly lastSyncMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  readonly urlLibroMaestro = signal<string>('');
  private lastSyncBenTimestamp = 0;
  // Filter Signals
  readonly filtroSubsidio = signal<SubsidioFiltro>('Todos');
  readonly filtroFecha = signal<string>(getTodayString());
  readonly filtroCarrera = signal<string>('TODAS');
  readonly filtroBusqueda = signal<string>('');
  readonly filtroNoConfirmaronCarrera = signal<string>('TODAS');

  constructor() {
    this.loadInitialState();
  }

  private loadInitialState(): void {
    // 1. Beneficiarios (Limpiar cualquier dato demo previo)
    const storedBen = this.getFromStorage<Beneficiario[]>(STORAGE_KEYS.BENEFICIARIOS);
    if (storedBen && storedBen.length > 0) {
      // Filtrar datos demo previos si existían
      const cleanBen = storedBen.filter(b => b.codigo !== '202410101' && b.codigo !== '202410102' && b.codigo !== '202320145');
      this.beneficiarios.set(cleanBen);
      this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, cleanBen);
    } else {
      this.beneficiarios.set([]);
      this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, []);
      setTimeout(() => this.sincronizarTodoLibroMaestro().catch(() => {}), 2000);
    }

    // 2. Formularios
    const storedForms = this.getFromStorage<FormularioConfig[]>(STORAGE_KEYS.FORMULARIOS);
    if (storedForms && storedForms.length > 0) {
      const updatedForms = storedForms.map(f => {
        if (f.tipo === 'Almuerzo' && (f.urlSheet.includes('DEMO') || f.urlSheet.includes('1W2QZvLIoOoI4v') || f.urlSheet.includes('2PACX') && !f.urlSheet.includes('/pubhtml'))) {
          return { ...f, urlSheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHzFv331883MM4x15ug_0IICKleeGQNwv44Sr5cNEa3x46pOKy7UgbENxHo9fXCNrz2L9SqyLePMXz/pubhtml' };
        }
        if (f.tipo === 'Refrigerio' && (f.urlSheet.includes('DEMO') || f.urlSheet.includes('1ArVWUB4HDFipBmb') || f.urlSheet.includes('2PACX') && !f.urlSheet.includes('/pubhtml'))) {
          return { ...f, urlSheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRYasG_i892iplw8kTyEjGDQI731MmncpRYhKVWDY2vop6KxbEDoEFGQ4AoFe2MboNX4CLWy_GbUoEI/pubhtml' };
        }
        return f;
      });
      this.formularios.set(updatedForms);
      this.saveToStorage(STORAGE_KEYS.FORMULARIOS, updatedForms);
    } else {
      this.formularios.set(SEED_FORMULARIOS);
      this.saveToStorage(STORAGE_KEYS.FORMULARIOS, SEED_FORMULARIOS);
    }

    // 3. Confirmaciones - siempre iniciar vacío (se llena desde Google Sheets)
    this.confirmaciones.set([]);
    this.saveToStorage(STORAGE_KEYS.CONFIRMACIONES, []);

    // 4. Libro Maestro - detectar y corregir URL vieja
    const storedMaestro = this.getFromStorage<string>(STORAGE_KEYS.LIBRO_MAESTRO);
    const publishedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_eD7coj74CyyYI6TUt68X1H-KaiQKc23VAW8ANvsCofp3TmYClguNGejpkhQyckEnbysM01viDjgE/pubhtml?gid=153155878&single=true';
    // Si la URL es vieja (/edit o /export) o no tiene /pubhtml, reemplazar
    if (!storedMaestro || storedMaestro.includes('/edit') || storedMaestro.includes('/export') || !storedMaestro.includes('/pubhtml')) {
      this.urlLibroMaestro.set(publishedUrl);
      this.saveToStorage(STORAGE_KEYS.LIBRO_MAESTRO, publishedUrl);
    } else {
      this.urlLibroMaestro.set(storedMaestro);
    }

    // Iniciar auto-sincronización en vivo cada 15 segundos
    this.iniciarAutoSync();

    // Sincronizar entregas desde el Libro Maestro (marcar como entregados)
    setTimeout(() => this.sincronizarEntregasDesdeMaestro().catch(() => {}), 3000);
  }

  private iniciarAutoSync(): void {
    setInterval(() => {
      if (!this.isSyncing()) {
        this.sincronizarConGoogleSheets();
      }
    }, 60000); // 60 segundos para confirmaciones en tiempo real
  }

  private generateInitialConfirmations(bens: Beneficiario[]): Confirmacion[] {
    const today = getTodayString();
    const confs: Confirmacion[] = [];

    // Valid confirmados (Almuerzo)
    const validAlmuerzo = bens.filter(b => b.subsidio === 'Almuerzo' || b.subsidio === 'Ambos').slice(0, 10);
    validAlmuerzo.forEach((b, idx) => {
      const isEntregado = idx < 4;
      confs.push({
        id: `conf-alm-${b.codigo}-${today}`,
        timestamp: `${today} 07:${String(15 + idx * 3).padStart(2, '0')}:12`,
        fecha: today,
        codigo: b.codigo,
        nombre: b.nombre,
        carrera: b.carrera,
        tipoSubsidio: 'Almuerzo',
        entregado: isEntregado,
        horaEntrega: isEntregado ? `12:${String(10 + idx * 5).padStart(2, '0')} PM` : undefined,
        esBeneficiarioValido: true,
        beneficiarioPadron: b,
        difiereNombre: false,
        origen: 'GoogleSheets'
      });
    });

    // Valid confirmados (Refrigerio)
    const validRefrig = bens.filter(b => b.subsidio === 'Refrigerio' || b.subsidio === 'Ambos').slice(0, 3);
    validRefrig.forEach((b, idx) => {
      confs.push({
        id: `conf-ref-${b.codigo}-${today}`,
        timestamp: `${today} 14:${String(20 + idx * 10).padStart(2, '0')}:45`,
        fecha: today,
        codigo: b.codigo,
        nombre: b.nombre,
        carrera: b.carrera,
        tipoSubsidio: 'Refrigerio',
        entregado: false,
        esBeneficiarioValido: true,
        beneficiarioPadron: b,
        difiereNombre: false,
        origen: 'GoogleSheets'
      });
    });

    // 1 Discrepancia de Nombre (e.g. puso diminutivo o segundo apellido)
    if (bens.length > 2) {
      const target = bens[2]; // Mateo González Restrepo
      confs.push({
        id: `conf-diff-${target.codigo}-${today}`,
        timestamp: `${today} 08:05:30`,
        fecha: today,
        codigo: target.codigo,
        nombre: 'MATEO GONZÁLEZ R.', // Difiere del padrón
        carrera: target.carrera,
        tipoSubsidio: 'Almuerzo',
        entregado: false,
        esBeneficiarioValido: true,
        beneficiarioPadron: target,
        difiereNombre: true,
        nombrePadron: target.nombre,
        origen: 'GoogleSheets'
      });
    }

    // 2 Extraños (No están en el padrón pero llenaron el form)
    confs.push({
      id: `conf-extra-9901-${today}`,
      timestamp: `${today} 08:30:15`,
      fecha: today,
      codigo: '202599014',
      nombre: 'ESTEBAN DAVID MEJÍA DUQUE',
      carrera: 'INGENIERÍA INDUSTRIAL',
      tipoSubsidio: 'Almuerzo',
      entregado: false,
      esBeneficiarioValido: false,
      difiereNombre: false,
      origen: 'GoogleSheets',
      observacion: 'No aparece registrado en el padrón iVMS-4200 activo.'
    });

    confs.push({
      id: `conf-extra-9902-${today}`,
      timestamp: `${today} 09:12:00`,
      fecha: today,
      codigo: '202599088',
      nombre: 'LILIANA MARCELA SUÁREZ',
      carrera: 'DERECHO',
      tipoSubsidio: 'Almuerzo',
      entregado: false,
      esBeneficiarioValido: false,
      difiereNombre: false,
      origen: 'GoogleSheets',
      observacion: 'No aparece registrado en el padrón iVMS-4200 activo.'
    });

    return confs;
  }

  // COMPUTED SIGNALS

  // Filtered by date, subsidy and career
  readonly confirmadosFiltrados = computed(() => {
    const list = this.confirmaciones();
    const fecha = this.filtroFecha();
    const subsidio = this.filtroSubsidio();
    const carrera = this.filtroCarrera();
    const busqueda = this.filtroBusqueda().trim().toLowerCase();

    return list.filter(c => {
      // Fecha
      if (fecha && c.fecha !== fecha) return false;
      // Subsidio
      if (subsidio !== 'Todos' && c.tipoSubsidio !== subsidio) return false;
      // Carrera
      if (carrera !== 'TODAS') {
        const visualC = getVisualCarrera(c.carrera);
        const visualFilter = getVisualCarrera(carrera);
        if (visualC.nombre !== visualFilter.nombre && !c.carrera.toUpperCase().includes(carrera.toUpperCase())) {
          return false;
        }
      }
      // Búsqueda
      if (busqueda) {
        const matchCode = this.normCode(c.codigo).includes(this.normCode(busqueda));
        const matchName = c.nombre.toLowerCase().includes(busqueda);
        const matchCarrera = c.carrera.toLowerCase().includes(busqueda);
        if (!matchCode && !matchName && !matchCarrera) return false;
      }
      return true;
    });
  });

  // Valid confirmados in padrón
  readonly confirmadosValidos = computed(() => {
    return this.confirmadosFiltrados().filter(c => c.esBeneficiarioValido && !c.entregado);
  });

  // Strange / Not in padrón
  readonly confirmadosExtranos = computed(() => {
    return this.confirmadosFiltrados().filter(c => !c.esBeneficiarioValido && !c.entregado);
  });

  // Beneficiarios from padrón that did NOT confirm for this date/meal
  readonly noConfirmaron = computed(() => {
    const padron = this.beneficiarios().filter(b => b.activo);
    const confs = this.confirmaciones();
    const fecha = this.filtroFecha();
    const subsidio = this.filtroSubsidio();
    const carreraNoConf = this.filtroNoConfirmaronCarrera();

    // Map of codes that confirmed on this date
    const confirmedCodes = new Set(
      confs
        .filter(c => c.fecha === fecha && (subsidio === 'Todos' || c.tipoSubsidio === subsidio))
        .map(c => c.codigo.trim())
    );

    return padron.filter(b => {
      // Must match subsidy type if selected
      if (subsidio !== 'Todos') {
        if (subsidio === 'Almuerzo' && b.subsidio !== 'Almuerzo' && b.subsidio !== 'Ambos') return false;
        if (subsidio === 'Refrigerio' && b.subsidio !== 'Refrigerio' && b.subsidio !== 'Ambos') return false;
      }

      // Must match career filter for no confirmaron accordion
      if (carreraNoConf !== 'TODAS') {
        const visualB = getVisualCarrera(b.carrera);
        const visualFilter = getVisualCarrera(carreraNoConf);
        if (visualB.nombre !== visualFilter.nombre && !b.carrera.toUpperCase().includes(carreraNoConf.toUpperCase())) {
          return false;
        }
      }

      // Has NOT confirmed
      return !confirmedCodes.has(b.codigo.trim());
    });
  });

  // KPIs
  readonly kpiStats = computed(() => {
    const list = this.confirmadosFiltrados();
    const total = list.length;
    const entregadas = list.filter(c => c.entregado).length;
    const pendientes = total - entregadas;
    const enPadron = list.filter(c => c.esBeneficiarioValido).length;
    const extranos = list.filter(c => !c.esBeneficiarioValido).length;
    const difiereNombre = list.filter(c => c.difiereNombre).length;

    return {
      total,
      entregadas,
      pendientes,
      enPadron,
      extranos,
      difiereNombre
    };
  });

  // Careers with current confirmation count for pills
  readonly carrerasConConteo = computed(() => {
    const confs = this.confirmaciones();
    const fecha = this.filtroFecha();
    const subsidio = this.filtroSubsidio();

    const counts: Record<string, number> = {};
    for (const c of CARRERAS_REGISTRADAS) {
      counts[c] = 0;
    }

    confs
      .filter(c => c.fecha === fecha && (subsidio === 'Todos' || c.tipoSubsidio === subsidio))
      .forEach(c => {
        const visual = getVisualCarrera(c.carrera);
        const key = visual.nombre;
        counts[key] = (counts[key] || 0) + 1;
      });

    return CARRERAS_REGISTRADAS.map(c => {
      const visual = getVisualCarrera(c);
      return {
        ...visual,
        conteo: counts[c] || 0
      };
    });
  });

  // PANEL DE ENTREGADOS Y HORAS
  readonly entregadosFiltrados = computed(() => {
    const list = this.confirmadosFiltrados();
    return list.filter(c => c.entregado);
  });

  readonly statsEntregas = computed(() => {
    const entregados = this.entregadosFiltrados();
    const totalEntregados = entregados.length;
    const almuerzos = entregados.filter(c => c.tipoSubsidio === 'Almuerzo').length;
    const refrigerios = entregados.filter(c => c.tipoSubsidio === 'Refrigerio').length;
    const desayunos = entregados.filter(c => c.tipoSubsidio === 'Desayuno').length;
    const excepcionales = entregados.filter(c => c.origen === 'Excepcional').length;
    const totalConfirmados = this.confirmadosFiltrados().length;
    const porcentaje = totalConfirmados > 0 ? Math.round((totalEntregados / totalConfirmados) * 100) : 0;

    // Ultimas entregas ordenadas por tiempo
    const conHora = entregados.filter(c => !!c.horaEntrega);
    const ultimaEntrega = conHora.length > 0 ? conHora[conHora.length - 1].horaEntrega : null;
    const primerEntrega = conHora.length > 0 ? conHora[0].horaEntrega : null;

    return {
      totalEntregados,
      totalConfirmados,
      porcentaje,
      almuerzos,
      refrigerios,
      desayunos,
      excepcionales,
      ultimaEntrega,
      primerEntrega
    };
  });

  // ACTIONS

  setFiltroSubsidio(subsidio: SubsidioFiltro): void {
    this.filtroSubsidio.set(subsidio);
  }

  setFiltroFecha(fecha: string): void {
    this.filtroFecha.set(fecha);
    if (!this.isSyncing()) {
      this.sincronizarConGoogleSheets();
    }
  }

  setFiltroCarrera(carrera: string): void {
    this.filtroCarrera.set(carrera);
  }

  setFiltroBusqueda(text: string): void {
    this.filtroBusqueda.set(text);
  }

  setFiltroNoConfirmaronCarrera(carrera: string): void {
    this.filtroNoConfirmaronCarrera.set(carrera);
  }

  clearSyncMessage(): void {
    this.lastSyncMessage.set(null);
  }

  // Toggle delivery status
  toggleEntregado(id: string): void {
    const all = this.confirmaciones();
    const updated = all.map(c => {
      if (c.id === id) {
        const newEntregado = !c.entregado;
        const hora = newEntregado ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : undefined;
        const updatedConf = { ...c, entregado: newEntregado, horaEntrega: hora };
        if (newEntregado) {
          this.syncEntregaToSheet(updatedConf);
        } else {
          this.syncDeleteEntregaToSheet(updatedConf);
        }
        return updatedConf;
      }
      return c;
    });
    this.confirmaciones.set(updated);
    this.saveToStorage(STORAGE_KEYS.CONFIRMACIONES, updated);
  }

  // Authorize strange student
  autorizarExtrano(conf: Confirmacion): void {
    this.toggleEntregado(conf.id);
  }

  // Sync entrega to Google Sheets via Apps Script
  private syncEntregaToSheet(conf: Confirmacion): void {
    const payload = {
      action: 'writeEntrega',
      fecha: conf.fecha,
      horaEntrega: conf.horaEntrega || '',
      codigo: conf.codigo,
      nombre: conf.nombre,
      carrera: conf.carrera,
      tipoSubsidio: conf.tipoSubsidio,
      entregado: conf.entregado,
      observacion: conf.observacion || ''
    };

    this.http.post('/api/apps-script', { url: APPS_SCRIPT_URL, payload }).subscribe({
      next: () => console.log('Entrega sincronizada al Libro Maestro'),
      error: (err) => console.warn('Error al sincronizar entrega:', err)
    });
  }

  // Delete entrega from Google Sheets via Apps Script (when reverting)
  private syncDeleteEntregaToSheet(conf: Confirmacion): void {
    const payload = {
      action: 'deleteEntrega',
      fecha: conf.fecha,
      codigo: conf.codigo,
      tipoSubsidio: conf.tipoSubsidio
    };

    this.http.post('/api/apps-script', { url: APPS_SCRIPT_URL, payload }).subscribe({
      next: () => console.log('Entrega eliminada del Libro Maestro'),
      error: (err) => console.warn('Error al eliminar entrega del Libro Maestro:', err)
    });
  }

  // Sync all beneficiarios to Google Sheets via Apps Script
  syncBeneficiariosToSheet(beneficiarios: Beneficiario[]): void {
    // Debounce: esperar 2 segundos entre llamadas
    const now = Date.now();
    if (now - this.lastSyncBenTimestamp < 2000) {
      console.log('Sync beneficiarios debounced, esperando...');
      return;
    }
    this.lastSyncBenTimestamp = now;

    const payload = {
      action: 'syncBeneficiarios',
      beneficiarios: beneficiarios.map(b => ({
        codigo: b.codigo,
        nombre: b.nombre,
        genero: b.genero,
        carrera: b.carrera,
        subsidio: b.subsidio,
        activo: b.activo
      }))
    };

    this.http.post('/api/apps-script', { url: APPS_SCRIPT_URL, payload }).subscribe({
      next: () => console.log('Beneficiarios sincronizados al Libro Maestro'),
      error: (err) => console.warn('Error al sincronizar beneficiarios:', err)
    });
  }

  // Deliver exceptional ration for non-confirmed padrón student
  marcarEntregaExcepcional(ben: Beneficiario, tipoSubsidio: 'Almuerzo' | 'Refrigerio' | 'Desayuno'): void {
    const today = this.filtroFecha();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newConf: Confirmacion = {
      id: `conf-exc-${ben.codigo}-${Date.now()}`,
      timestamp: `${today} ${timeStr}`,
      fecha: today,
      codigo: ben.codigo,
      nombre: ben.nombre,
      carrera: ben.carrera,
      tipoSubsidio: tipoSubsidio,
      entregado: true,
      horaEntrega: timeStr,
      esBeneficiarioValido: true,
      beneficiarioPadron: ben,
      difiereNombre: false,
      origen: 'Excepcional',
      observacion: 'Entrega excepcional autorizada en ventanilla (no llenó formulario previo)'
    };

    const updated = [newConf, ...this.confirmaciones()];
    this.confirmaciones.set(updated);
    this.saveToStorage(STORAGE_KEYS.CONFIRMACIONES, updated);
    this.syncEntregaToSheet(newConf);
    this.lastSyncMessage.set({
      type: 'success',
      text: `Entrega excepcional registrada para ${ben.nombre} (${ben.codigo}).`
    });
  }

  // Beneficiarios CRUD
  agregarBeneficiario(b: Beneficiario): void {
    const all = this.beneficiarios();
    const exists = all.some(x => x.codigo.trim() === b.codigo.trim());
    if (exists) {
      // update
      const updated = all.map(x => (x.codigo.trim() === b.codigo.trim() ? b : x));
      this.beneficiarios.set(updated);
      this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, updated);
    } else {
      const updated = [b, ...all];
      this.beneficiarios.set(updated);
      this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, updated);
    }
    this.revalidateConfirmacionesWithPadron();
    this.syncBeneficiariosToSheet(this.beneficiarios());
  }

  eliminarBeneficiario(codigo: string): void {
    const updated = this.beneficiarios().filter(b => b.codigo.trim() !== codigo.trim());
    this.beneficiarios.set(updated);
    this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, updated);
    this.revalidateConfirmacionesWithPadron();
    this.syncBeneficiariosToSheet(updated);
  }

  toggleActivoBeneficiario(codigo: string): void {
    const updated = this.beneficiarios().map(b => {
      if (b.codigo.trim() === codigo.trim()) {
        return { ...b, activo: !b.activo };
      }
      return b;
    });
    this.beneficiarios.set(updated);
    this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, updated);
    this.revalidateConfirmacionesWithPadron();
    this.syncBeneficiariosToSheet(updated);
  }

  vaciarPadron(): void {
    this.beneficiarios.set([]);
    this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, []);
    this.revalidateConfirmacionesWithPadron();
  }

  // Revalidates confirmations validation status whenever padrón changes
  private revalidateConfirmacionesWithPadron(): void {
    const padron = this.beneficiarios();
    const confs = this.confirmaciones().map(c => {
      const match = padron.find(b => this.normCode(b.codigo) === this.normCode(c.codigo) && b.activo);
      if (match) {
        const difiere = this.verificarDiscrepanciaNombre(c.nombre, match.nombre);
        const carreraOk = match.carrera.toUpperCase().includes(c.carrera.toUpperCase()) || c.carrera.toUpperCase().includes(match.carrera.toUpperCase());
        if (!carreraOk) {
          return {
            ...c,
            esBeneficiarioValido: false,
            beneficiarioPadron: match,
            difiereNombre: false,
            nombrePadron: match.nombre,
            observacion: `ID válido pero pertenece a ${match.carrera}, no a ${c.carrera}`
          };
        }
        return {
          ...c,
          esBeneficiarioValido: true,
          beneficiarioPadron: match,
          difiereNombre: difiere,
          nombrePadron: match.nombre
        };
      } else {
        return {
          ...c,
          esBeneficiarioValido: false,
          beneficiarioPadron: undefined,
          difiereNombre: false,
          nombrePadron: undefined
        };
      }
    });
    this.confirmaciones.set(confs);
    this.saveToStorage(STORAGE_KEYS.CONFIRMACIONES, confs);
  }

  private normCode(raw: string): string {
    return raw.trim().toLowerCase().replace(/^0+/g, '');
  }

  private verificarDiscrepanciaNombre(nameForm: string, namePadron: string): boolean {
    const clean1 = nameForm.toUpperCase().replace(/[^A-Z]/g, '');
    const clean2 = namePadron.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean1 === clean2) return false;
    // Si uno contiene al otro, no es discrepancia (el formulario puede tener nombre abreviado)
    if (clean1.includes(clean2) || clean2.includes(clean1)) return false;
    // Comparar palabras individuales (apellidos)
    const words1 = clean1.split('');
    const words2 = clean2.split('');
    // Si al menos 2 palabras coinciden, no es discrepancia
    const padronWords = namePadron.toUpperCase().split(/\s+/).filter(w => w.length > 2);
    const formWords = nameForm.toUpperCase().split(/\s+/).filter(w => w.length > 2);
    const matchingWords = padronWords.filter(pw => formWords.some(fw => fw.includes(pw) || pw.includes(fw)));
    return matchingWords.length < 2;
  }

  // CSV Import for Beneficiarios (iVMS-4200 format or iVMS access control format)
  importarBeneficiariosCSV(csvText: string, skipSync = false): { inserted: number; updated: number; errors: number } {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { inserted: 0, updated: 0, errors: 0 };

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    const currentMap = new Map<string, Beneficiario>(
      this.beneficiarios().map(b => [this.normCode(b.codigo), b])
    );

    // Detect delimiter: check header
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';

    // Check if first line is header
    const startsWithHeader = /c[oó]digo|nombre|persona|identificaci[oó]n|carrera|programa/i.test(firstLine);
    const startIdx = startsWithHeader ? 1 : 0;

    // Detect CSV format by header
    const headerLower = firstLine.toLowerCase();
    const isAccessControlFormat = headerLower.includes('id de persona') || headerLower.includes('organizaci');

    // Column mapping based on format
    let colCodigo = 0, colNombre = 1, colGenero = 2, colCarrera = 3, colSubsidio = 4;

    if (isAccessControlFormat && startsWithHeader) {
      // iVMS access control format:
      // ID de persona;Organización;Nombre de persona;Sexo;Tel.;Correo electrónico;...
      const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
      colCodigo = headers.findIndex(h => h.includes('id de persona') || h.includes('identificaci'));
      colNombre = headers.findIndex(h => h.includes('nombre de persona') || h.includes('nombre'));
      colGenero = headers.findIndex(h => h.includes('sexo'));
      colCarrera = headers.findIndex(h => h.includes('organizaci'));
      colSubsidio = -1;
    }

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 2) {
        errors++;
        continue;
      }

      const codigo = colCodigo >= 0 ? cols[colCodigo] : cols[0];
      const nombre = (colNombre >= 0 ? cols[colNombre] : cols[1])?.toUpperCase() || '';
      
      if (!codigo || !nombre) {
        errors++;
        continue;
      }

      let genero: 'Hombre' | 'Mujer' = 'Hombre';
      let carrera = 'PROGRAMA ACADÉMICO';
      let subsidio: TipoSubsidio = 'Almuerzo';

      if (colGenero >= 0 && cols.length > colGenero) {
        const gRaw = cols[colGenero].trim();
        // CSV format: 1 = Hombre, 2 = Mujer; also accept F/M, H/M, etc.
        if (gRaw === '2' || gRaw.startsWith('F') || gRaw.includes('MUJ') || gRaw.includes('FEM') || gRaw.toUpperCase() === 'M') {
          genero = 'Mujer';
        }
      } else if (cols.length >= 3) {
        const gRaw = cols[2].trim();
        if (gRaw === '2' || gRaw.startsWith('F') || gRaw.includes('MUJ') || gRaw.includes('FEM')) {
          genero = 'Mujer';
        }
      }

      if (colCarrera >= 0 && cols.length > colCarrera && cols[colCarrera]) {
        const orgRaw = cols[colCarrera].toUpperCase();
        // Extract career from organization path: "UNIVERSIDAD/estudiantes/AGROINDUSTRIAL" → "AGROINDUSTRIAL"
        const orgParts = orgRaw.split('/');
        const lastPart = orgParts[orgParts.length - 1].trim();
        // If last part looks like a career name (not just "estudiantes", "empleados", etc.)
        if (lastPart && !['ESTUDIANTES', 'EMPLEADOS', 'DOCENTES', 'ADMINISTRATIVO', 'UNIVERSIDAD'].includes(lastPart)) {
          carrera = lastPart;
        } else if (orgParts.length >= 3) {
          // Try second to last part
          carrera = orgParts[orgParts.length - 2].trim();
        } else {
          carrera = orgRaw;
        }
      } else if (cols.length >= 4 && cols[3]) {
        carrera = cols[3].toUpperCase();
      }

      if (colSubsidio >= 0 && cols.length > colSubsidio && cols[colSubsidio]) {
        const sRaw = cols[colSubsidio].toUpperCase();
        if (sRaw.includes('AMB')) subsidio = 'Ambos';
        else if (sRaw.includes('REF') || sRaw.includes('NOCH')) subsidio = 'Refrigerio';
        else subsidio = 'Almuerzo';
      } else if (cols.length >= 5 && cols[4]) {
        const sRaw = cols[4].toUpperCase();
        if (sRaw.includes('AMB')) subsidio = 'Ambos';
        else if (sRaw.includes('REF') || sRaw.includes('NOCH')) subsidio = 'Refrigerio';
        else subsidio = 'Almuerzo';
      } else {
        // Auto-detect subsidio based on career (nocturnal careers = Refrigerio, weekend = special)
        const cUpper = carrera.toUpperCase();
        if (cUpper.includes('FINANCIER') || cUpper.includes('TRABAJO SOCIAL')) {
          subsidio = 'Refrigerio';
        } else if (cUpper.includes('REGENC') || cUpper.includes('TECNICO')) {
          subsidio = 'Ambos'; // Refrigerio (sáb) + Desayuno (dom)
        } else if (cUpper.includes('ADEA')) {
          subsidio = 'Almuerzo'; // Solo sábados
        }
      }

      const key = this.normCode(codigo);
      const existing = currentMap.get(key);

      const ben: Beneficiario = {
        codigo,
        nombre,
        genero,
        carrera,
        subsidio,
        activo: true,
        fechaRegistro: getTodayString()
      };

      if (existing) {
        currentMap.set(key, { ...existing, ...ben });
        updated++;
      } else {
        currentMap.set(key, ben);
        inserted++;
      }
    }

    const finalList = Array.from(currentMap.values());
    this.beneficiarios.set(finalList);
    this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, finalList);
    this.revalidateConfirmacionesWithPadron();
    if (!skipSync) {
      this.syncBeneficiariosToSheet(finalList);
    }

    return { inserted, updated, errors };
  }

  // Import Confirmations from CSV / TSV (from Google Sheets or Google Forms export)
  importarConfirmacionesCSV(
    csvText: string,
    tipoOverride?: 'Almuerzo' | 'Refrigerio' | 'Desayuno' | 'Auto'
  ): { total: number; nuevos: number } {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { total: 0, nuevos: 0 };

    const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    const startsWithHeader = /marca|timestamp|fecha|hora|c[oó]digo|carrera|nombre/i.test(lines[0]);
    const startIdx = startsWithHeader ? 1 : 0;

    const padron = this.beneficiarios();
    const existing = [...this.confirmaciones()];
    const existingIds = new Set(existing.map(c => `${c.fecha}-${c.codigo.toLowerCase()}-${c.tipoSubsidio}`));

    let nuevos = 0;
    const defaultFecha = this.filtroFecha();

    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 2) continue;

      // Detect column positions
      // Form layout:
      // Timestamp | Carrera | Código | Nombre Completo | [Tipo]
      let timestamp = `${defaultFecha} 08:00:00`;
      let carrera = '';
      let codigo = '';
      let nombre = '';
      let tipo: 'Almuerzo' | 'Refrigerio' | 'Desayuno' = tipoOverride && tipoOverride !== 'Auto' ? tipoOverride : 'Almuerzo';

      if (cols.length >= 4) {
        timestamp = cols[0] || timestamp;
        carrera = cols[1] || '';
        codigo = cols[2] || '';
        nombre = cols[3] || '';
        if (cols.length >= 5 && cols[4]) {
          const colUpper = cols[4].toUpperCase();
          if (colUpper.includes('REF') || colUpper.includes('NOCH')) {
            tipo = 'Refrigerio';
          } else if (colUpper.includes('DESAY') || colUpper.includes('DES')) {
            tipo = 'Desayuno';
          }
        }
      } else if (cols.length === 3) {
        codigo = cols[0];
        nombre = cols[1];
        carrera = cols[2];
      } else if (cols.length === 2) {
        codigo = cols[0];
        nombre = cols[1];
      }

      if (!codigo) continue;

      // Extract date from timestamp if available
      let fecha = defaultFecha;
      const dateMatch = timestamp.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}[-/]\d{1,2}[-/]\d{4})/);
      if (dateMatch) {
        const rawDate = dateMatch[0];
        if (rawDate.includes('/')) {
          const parts = rawDate.split('/');
          if (parts[2].length === 4) {
            // DD/MM/YYYY
            fecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else {
            // YYYY/MM/DD
            fecha = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          }
        }
      }

      const matchPadron = padron.find(b => this.normCode(b.codigo) === this.normCode(codigo) && b.activo);
      const isValido = !!matchPadron;
      const difiere = matchPadron ? this.verificarDiscrepanciaNombre(nombre, matchPadron.nombre) : false;

      // Final carrera inference if blank
      if (!carrera && matchPadron) {
        carrera = matchPadron.carrera;
      }

      const uniqueKey = `${fecha}-${codigo.toLowerCase()}-${tipo}`;
      if (!existingIds.has(uniqueKey)) {
        const newConf: Confirmacion = {
          id: `conf-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp,
          fecha,
          codigo,
          nombre: nombre.toUpperCase(),
          carrera: carrera || 'PROGRAMA ACADÉMICO',
          tipoSubsidio: tipo,
          entregado: false,
          esBeneficiarioValido: isValido,
          beneficiarioPadron: matchPadron,
          difiereNombre: difiere,
          nombrePadron: matchPadron?.nombre,
          origen: 'CSV'
        };

        existing.unshift(newConf);
        existingIds.add(uniqueKey);
        nuevos++;
      }
    }

    this.confirmaciones.set(existing);
    this.saveToStorage(STORAGE_KEYS.CONFIRMACIONES, existing);
    this.revalidateConfirmacionesWithPadron();

    return { total: lines.length - startIdx, nuevos };
  }

  // Real or Simulated Google Sheets Synchronization
  async sincronizarConGoogleSheets(formId?: string): Promise<{ success: boolean; message: string }> {
    this.isSyncing.set(true);
    this.lastSyncMessage.set(null);

    const forms = this.formularios();
    const targets = formId ? forms.filter(f => f.id === formId) : forms.filter(f => f.activo);

    if (targets.length === 0) {
      this.isSyncing.set(false);
      const msg = { type: 'error' as const, text: 'No hay formularios configurados o activos para sincronizar.' };
      this.lastSyncMessage.set(msg);
      return { success: false, message: msg.text };
    }

    let totalNuevos = 0;
    const errors: string[] = [];

    for (const form of targets) {
      try {
        if (form.urlSheet && (form.urlSheet.startsWith('http://') || form.urlSheet.startsWith('https://'))) {
          try {
            const resp = await firstValueFrom(
              this.http.post<{ success: boolean; csvText: string; error?: string }>('/api/fetch-sheet', {
                url: form.urlSheet
              }).pipe(catchError(() => of(null)))
            );

            if (resp && resp.csvText) {
              const res = this.importarConfirmacionesCSV(resp.csvText, form.tipo);
              totalNuevos += res.nuevos;
              this.updateFormLastSync(form.id, res.nuevos);
              continue;
            }
          } catch (e: unknown) {
            const errLog = e instanceof Error ? e.message : 'Error desconocido';
            console.warn('Real Google Sheets fetch could not complete, using simulated response sync:', errLog);
          }
        }

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error de conexión';
        errors.push(`${form.nombre}: ${message}`);
      }
    }

    this.isSyncing.set(false);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (errors.length > 0) {
      const msg = {
        type: 'error' as const,
        text: `Sincronización finalizada con advertencias: ${errors.join(', ')}`
      };
      this.lastSyncMessage.set(msg);
      return { success: false, message: msg.text };
    }

    const msg = {
      type: 'success' as const,
      text: `Sincronización completada con éxito (${nowTime}). ${totalNuevos} confirmaciones sincronizadas desde Google Sheets.`
    };
    this.lastSyncMessage.set(msg);
    return { success: true, message: msg.text };
  }

  private updateFormLastSync(formId: string, count: number): void {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = this.formularios().map(f => {
      if (f.id === formId) {
        return {
          ...f,
          ultimaSincronizacion: `Hoy, ${nowTime}`,
          totalRespuestasSincronizadas: (f.totalRespuestasSincronizadas || 0) + count
        };
      }
      return f;
    });
    this.formularios.set(updated);
    this.saveToStorage(STORAGE_KEYS.FORMULARIOS, updated);
  }

  guardarFormularioConfig(form: FormularioConfig): void {
    const all = this.formularios();
    const exists = all.some(f => f.id === form.id);
    let updated: FormularioConfig[];
    if (exists) {
      updated = all.map(f => (f.id === form.id ? form : f));
    } else {
      updated = [...all, form];
    }
    this.formularios.set(updated);
    this.saveToStorage(STORAGE_KEYS.FORMULARIOS, updated);
    this.lastSyncMessage.set({
      type: 'success',
      text: `Configuración de "${form.nombre}" guardada correctamente.`
    });
  }

  toggleGoogleConnection(): void {
    this.isGoogleConnected.update(v => !v);
  }

  resetToDemoData(): void {
    this.beneficiarios.set(SEED_BENEFICIARIOS);
    this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, SEED_BENEFICIARIOS);

    this.formularios.set(SEED_FORMULARIOS);
    this.saveToStorage(STORAGE_KEYS.FORMULARIOS, SEED_FORMULARIOS);

    const initialConfs = this.generateInitialConfirmations(SEED_BENEFICIARIOS);
    this.confirmaciones.set(initialConfs);
    this.saveToStorage(STORAGE_KEYS.CONFIRMACIONES, initialConfs);

    this.lastSyncMessage.set({
      type: 'success',
      text: 'Datos del sistema restablecidos al estado inicial de demostración.'
    });
  }

  // Guardar y Sincronizar Libro Maestro
  guardarUrlLibroMaestro(url: string): void {
    const cleanUrl = url.trim();
    this.urlLibroMaestro.set(cleanUrl);
    this.saveToStorage(STORAGE_KEYS.LIBRO_MAESTRO, cleanUrl);
  }

  // Sincronizar Padrón y Formularios desde el Libro Maestro
  async sincronizarTodoLibroMaestro(urlManual?: string): Promise<{ success: boolean; message: string }> {
    const targetUrl = (urlManual || this.urlLibroMaestro()).trim();
    if (!targetUrl) {
      const msg = 'Por favor ingresa la URL de tu Libro Maestro de Google Sheets.';
      this.lastSyncMessage.set({ type: 'error', text: msg });
      return { success: false, message: msg };
    }

    this.guardarUrlLibroMaestro(targetUrl);
    this.isSyncing.set(true);

    try {
      // 1. Obtener contenido del Libro Maestro
      const resp = await firstValueFrom(
        this.http.post<{ success: boolean; csvText: string; error?: string }>('/api/fetch-sheet', {
          url: targetUrl
        })
      );

      if (!resp || !resp.csvText) {
        throw new Error(resp?.error || 'No se pudo leer el contenido del Libro Maestro.');
      }

      const csv = resp.csvText;
      let totalImportados = 0;
      let totalFormsActualizados = 0;

      // Detectar si el CSV contiene lista de beneficiarios o respuestas de formularios
      if (csv.includes('Marca temporal') || csv.includes('Timestamp')) {
        // Es un formulario de respuestas directamente
        const stats = this.importarConfirmacionesCSV(csv, 'Auto');
        if (stats.total > 0) {
          const msg = `Sincronizadas ${stats.total} respuestas (${stats.nuevos} nuevas confirmaciones) desde la hoja vinculada.`;
          this.lastSyncMessage.set({ type: 'success', text: msg });
          return { success: true, message: msg };
        }
      }

      // Si tiene columnas de Beneficiarios (Codigo, Nombre...)
      const resBen = this.importarBeneficiariosCSV(csv, true);
      totalImportados = resBen.inserted + resBen.updated;

      // Buscar enlaces a otros Google Sheets dentro del texto para vincular formularios automáticamente
      const sheetUrls = csv.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+/g);
      if (sheetUrls && sheetUrls.length > 0) {
        const uniqueUrls = [...new Set(sheetUrls)].filter(u => !targetUrl.includes(u));
        if (uniqueUrls.length > 0) {
          const currentForms = [...this.formularios()];
          uniqueUrls.forEach((u, i) => {
            if (i === 0 && currentForms[0]) {
              currentForms[0] = { ...currentForms[0], urlSheet: u };
              totalFormsActualizados++;
            } else if (i === 1 && currentForms[1]) {
              currentForms[1] = { ...currentForms[1], urlSheet: u };
              totalFormsActualizados++;
            }
          });
          this.formularios.set(currentForms);
          this.saveToStorage(STORAGE_KEYS.FORMULARIOS, currentForms);
        }
      }

      // Sincronizar automáticamente los formularios vinculados
      await this.sincronizarConGoogleSheets();

      // Sincronizar entregas registradas en el Libro Maestro
      await this.sincronizarEntregasDesdeMaestro();

      const summaryMsg = `Libro Maestro conectado: ${totalImportados} beneficiarios sincronizados y ${totalFormsActualizados} enlaces de formularios actualizados.`;
      this.lastSyncMessage.set({ type: 'success', text: summaryMsg });
      return { success: true, message: summaryMsg };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al sincronizar con el Libro Maestro';
      this.lastSyncMessage.set({ type: 'error', text: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      this.isSyncing.set(false);
    }
  }

  private async sincronizarEntregasDesdeMaestro(): Promise<void> {
    try {
      const entregasUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_eD7coj74CyyYI6TUt68X1H-KaiQKc23VAW8ANvsCofp3TmYClguNGejpkhQyckEnbysM01viDjgE/pubhtml?gid=1988377971&single=true';
      const resp = await firstValueFrom(
        this.http.post<{ success: boolean; csvText: string; error?: string }>('/api/fetch-sheet', {
          url: entregasUrl
        }).pipe(catchError(() => of(null)))
      );

      if (!resp || !resp.csvText) return;

      const lines = resp.csvText.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return;

      const header = lines[0].toLowerCase();
      const isEntregasSheet = header.includes('codigo') && (header.includes('entrega') || header.includes('hora'));
      if (!isEntregasSheet) return;

      const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
      const rows = lines.slice(1);
      const existing = [...this.confirmaciones()];
      let created = 0;
      let marked = 0;

      for (const row of rows) {
        const cols = row.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 6) continue;

        const [fecha, horaEntrega, codigo, nombre, carrera, tipoSubsidio, estado] = cols;

        if (estado?.toUpperCase() !== 'ENTREGADO') continue;
        if (!fecha || !codigo) continue;

        const key = `${fecha.trim()}-${this.normCode(codigo)}-${tipoSubsidio?.trim().toLowerCase()}`;

        const existingMatch = existing.find(c =>
          `${c.fecha}-${c.codigo.toLowerCase()}-${c.tipoSubsidio.toLowerCase()}` === key
        );

        if (existingMatch) {
          if (!existingMatch.entregado) {
            existingMatch.entregado = true;
            existingMatch.horaEntrega = horaEntrega || existingMatch.horaEntrega;
            existingMatch.timestamp = `${fecha} ${horaEntrega || existingMatch.timestamp.split(' ')[1] || ''}`.trim();
            marked++;
          }
        } else {
          const padron = this.beneficiarios().find(b => this.normCode(b.codigo) === this.normCode(codigo));
          const newConf: Confirmacion = {
            id: `conf-maestro-${codigo}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: `${fecha} ${horaEntrega || ''}`.trim(),
            fecha: fecha.trim(),
            codigo: codigo.trim(),
            nombre: nombre?.trim() || padron?.nombre || 'Sin nombre',
            carrera: carrera?.trim() || padron?.carrera || '',
            tipoSubsidio: (tipoSubsidio?.trim() || 'Almuerzo') as 'Almuerzo' | 'Refrigerio' | 'Desayuno',
            entregado: true,
            esBeneficiarioValido: !!padron,
            beneficiarioPadron: padron || undefined,
            difiereNombre: false,
            origen: 'LibroMaestro',
            horaEntrega: horaEntrega || undefined
          };
          existing.push(newConf);
          created++;
        }
      }

      if (created > 0 || marked > 0) {
        this.confirmaciones.set(existing);
        this.saveToStorage(STORAGE_KEYS.CONFIRMACIONES, existing);
      }
    } catch {
      // Silently fail - entregas sync is best-effort
    }
  }

  // Plantilla para la hoja "Formularios_Links" del Libro Maestro
  getPlantillaFormulariosLinksTexto(): string {
    const headers = 'ID_Formulario\tNombre_Servicio\tTipo_Subsidio\tURL_Google_Sheet_Respuestas\tHorario_Atencion\tCarreras_Autorizadas';
    const rows = [
      'almuerzo-diurno\tConfirmación Almuerzo Diurno\tAlmuerzo\thttps://docs.google.com/spreadsheets/d/1W2QZvLIoOoI4v_zc1NzeGJh2etxlknR-DkKa9ob-2u8/edit?usp=sharing\t5:00 AM a 10:00 AM\t9 Carreras Diurnas',
      'refrigerio-noche\tConfirmación Refrigerio Noche\tRefrigerio\thttps://docs.google.com/spreadsheets/d/1ArVWUB4HDFipBmb-hO33E5RN7RQEn2Ew-OGNZ9eshYw/edit?usp=sharing\t2:00 PM a 7:00 PM\tAdmon Financiera y Trabajo Social'
    ];
    return [headers, ...rows].join('\n');
  }

  // Plantilla para la hoja "Entregas_Registro" del Libro Maestro
  getPlantillaEntregasTexto(): string {
    const headers = 'Fecha\tHora_Entrega\tCodigo_ID\tNombre_Estudiante\tCarrera\tTipo_Subsidio\tEstado_Entrega\tObservaciones';
    const sampleConfs = this.confirmaciones().slice(0, 8).map(c => 
      `${c.fecha}\t${c.horaEntrega || c.timestamp.split(' ')[1] || '12:30:00'}\t${c.codigo}\t${c.nombre}\t${c.carrera}\t${c.tipoSubsidio}\t${c.entregado ? 'ENTREGADO' : 'PENDIENTE'}\t${c.observacion || 'Verificado'}`
    );
    return [headers, ...sampleConfs].join('\n');
  }

  // Sincronizar Padrón de Beneficiarios directamente desde una pestaña de Google Sheet
  async sincronizarPadronDesdeGoogleSheet(urlSheet: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const cleanUrl = urlSheet.trim();
      if (!cleanUrl) {
        return { success: false, message: 'Ingrese una URL válida de Google Sheets.', count: 0 };
      }

      const resp = await firstValueFrom(
        this.http.post<{ success: boolean; csvText: string; error?: string }>('/api/fetch-sheet', {
          url: cleanUrl
        })
      );

      if (resp && resp.csvText) {
        const res = this.importarBeneficiariosCSV(resp.csvText, true);
        const msg = `Padrón actualizado: ${res.inserted} nuevos estudiantes agregados, ${res.updated} actualizados.`;
        this.lastSyncMessage.set({ type: 'success', text: msg });
        return { success: true, message: msg, count: res.inserted + res.updated };
      } else {
        return { success: false, message: 'La hoja de cálculo no devolvió datos legibles.', count: 0 };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al conectar con Google Sheets';
      this.lastSyncMessage.set({ type: 'error', text: message });
      return { success: false, message, count: 0 };
    }
  }

  // Generadores de Texto y Plantillas para crear las Hojas en Google Sheets
  getPlantillaBeneficiariosTexto(): string {
    const headers = 'Código ID\tNombre Completo\tGénero\tPrograma Académico / Carrera\tTipo Subsidio\tActivo';
    const sampleRows = this.beneficiarios().slice(0, 10).map(b => 
      `${b.codigo}\t${b.nombre}\t${b.genero}\t${b.carrera}\t${b.subsidio}\t${b.activo ? 'SI' : 'NO'}`
    );
    return [headers, ...sampleRows].join('\n');
  }

  getPlantillaCarrerasTexto(): string {
    const headers = 'ID\tNombre Oficial del Programa Académico\tJornada';
    const rows = [
      '1\tADMINISTRACIÓN DE EMPRESAS\tDiurna',
      '2\tCONTADURÍA\tDiurna',
      '3\tDERECHO\tDiurna',
      '4\tECONOMÍA\tDiurna',
      '5\tINGENIERÍA DE SISTEMAS\tDiurna',
      '6\tINGENIERÍA ELECTRÓNICA\tDiurna',
      '7\tINGENIERÍA INDUSTRIAL\tDiurna',
      '8\tLICENCIATURA EN INGLÉS\tDiurna',
      '9\tPSICOLOGÍA\tDiurna',
      '10\tADMINISTRACIÓN FINANCIERA\tNocturna',
      '11\tTRABAJO SOCIAL\tNocturna'
    ];
    return [headers, ...rows].join('\n');
  }

  getPlantillaSubsidiosTexto(): string {
    const headers = 'Tipo de Subsidio\tFranja Horaria Recomendada\tDescripción';
    const rows = [
      'Almuerzo\t11:30 AM a 2:30 PM\tServicio de almuerzo diurno para 9 carreras',
      'Refrigerio\t5:30 PM a 8:00 PM\tServicio de refrigerio nocturno para Admon Financiera y Trabajo Social',
      'Ambos\tDiurna y Nocturna\tEstudiantes autorizados para ambos servicios'
    ];
    return [headers, ...rows].join('\n');
  }

  // Generador de Código Completo de Google Apps Script para el Libro Maestro
  getGoogleAppsScriptCodigo(): string {
    return `/**
 * SISTEMA CAFETERÍA GUARINCITO - SCRIPT MAESTRO DE AUTOMATIZACIÓN (Google Apps Script)
 * 
 * 1. Crea automáticamente las 5 pestañas del Libro Maestro con sus encabezados y catálogos.
 * 2. Trae las respuestas consolidadas de los libros de Almuerzo y Refrigerio en tiempo real.
 * 3. Añade un menú personalizado "Cafetería Guarincito" a la barra de Google Sheets.
 */

// ID de tu Libro Maestro
const ID_LIBRO_MAESTRO = "1lHMpJKjheEG8sxiKb3K_-vkJrtbsuBBGkOuP5iA0Rcs";

// IDs de tus hojas de respuestas de formularios
const ID_SHEET_ALMUERZO = "1W2QZvLIoOoI4v_zc1NzeGJh2etxlknR-DkKa9ob-2u8";
const ID_SHEET_REFRIGERIO = "1ArVWUB4HDFipBmb-hO33E5RN7RQEn2Ew-OGNZ9eshYw";

/**
 * FUNCIÓN PRINCIPAL: Ejecuta esta función desde tu proyecto de Apps Script
 * para configurar automáticamente tu Libro Maestro por ID.
 */
function configurarLibroMaestroPorId() {
  const ss = SpreadsheetApp.openById(ID_LIBRO_MAESTRO);
  
  // 1. Pestaña: Beneficiarios
  let sBen = ss.getSheetByName("Beneficiarios") || ss.insertSheet("Beneficiarios");
  if (sBen.getLastRow() === 0) {
    sBen.appendRow(["Código ID", "Nombre Completo", "Género", "Programa Académico", "Tipo Subsidio", "Activo"]);
    sBen.getRange("A1:F1").setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    sBen.setFrozenRows(1);
  }
  
  // 2. Pestaña: Formularios_Links
  let sLinks = ss.getSheetByName("Formularios_Links") || ss.insertSheet("Formularios_Links");
  if (sLinks.getLastRow() === 0) {
    sLinks.appendRow(["ID_Formulario", "Nombre_Servicio", "Tipo_Subsidio", "URL_Google_Sheet_Respuestas", "Horario_Atencion", "Carreras_Autorizadas"]);
    sLinks.appendRow([
      "almuerzo-diurno", 
      "Confirmación Almuerzo Diurno", 
      "Almuerzo", 
      "https://docs.google.com/spreadsheets/d/" + ID_SHEET_ALMUERZO + "/edit?usp=sharing", 
      "5:00 AM a 10:00 AM", 
      "9 Carreras Diurnas"
    ]);
    sLinks.appendRow([
      "refrigerio-noche", 
      "Confirmación Refrigerio Noche", 
      "Refrigerio", 
      "https://docs.google.com/spreadsheets/d/" + ID_SHEET_REFRIGERIO + "/edit?usp=sharing", 
      "2:00 PM a 7:00 PM", 
      "ADMON FINANCIERA · TRABAJO SOCIAL"
    ]);
    sLinks.getRange("A1:F1").setBackground("#0f766e").setFontColor("#ffffff").setFontWeight("bold");
    sLinks.setFrozenRows(1);
  }
  
  // 3. Pestaña: Entregas_Registro
  let sEntregas = ss.getSheetByName("Entregas_Registro") || ss.insertSheet("Entregas_Registro");
  if (sEntregas.getLastRow() === 0) {
    sEntregas.appendRow(["Fecha", "Hora_Entrega", "Codigo_ID", "Nombre_Estudiante", "Carrera", "Tipo_Subsidio", "Estado_Entrega", "Observaciones"]);
    sEntregas.getRange("A1:H1").setBackground("#047857").setFontColor("#ffffff").setFontWeight("bold");
    sEntregas.setFrozenRows(1);
  }

  // 4. Pestaña: Carreras
  let sCarreras = ss.getSheetByName("Carreras") || ss.insertSheet("Carreras");
  if (sCarreras.getLastRow() === 0) {
    sCarreras.appendRow(["ID", "Nombre Oficial del Programa Académico", "Jornada"]);
    const carreras = [
      [1, "ADMINISTRACIÓN DE EMPRESAS", "Diurna"],
      [2, "CONTADURÍA", "Diurna"],
      [3, "DERECHO", "Diurna"],
      [4, "ECONOMÍA", "Diurna"],
      [5, "INGENIERÍA DE SISTEMAS", "Diurna"],
      [6, "INGENIERÍA ELECTRÓNICA", "Diurna"],
      [7, "INGENIERÍA INDUSTRIAL", "Diurna"],
      [8, "LICENCIATURA EN INGLÉS", "Diurna"],
      [9, "PSICOLOGÍA", "Diurna"],
      [10, "ADMINISTRACIÓN FINANCIERA", "Nocturna"],
      [11, "TRABAJO SOCIAL", "Nocturna"]
    ];
    carreras.forEach(c => sCarreras.appendRow(c));
    sCarreras.getRange("A1:C1").setBackground("#6b21a8").setFontColor("#ffffff").setFontWeight("bold");
    sCarreras.setFrozenRows(1);
  }

  // 5. Pestaña: TipoSubsidio
  let sSubsidios = ss.getSheetByName("TipoSubsidio") || ss.insertSheet("TipoSubsidio");
  if (sSubsidios.getLastRow() === 0) {
    sSubsidios.appendRow(["Tipo de Subsidio", "Franja Horaria Recomendada", "Descripción"]);
    sSubsidios.appendRow(["Almuerzo", "11:30 AM a 2:30 PM", "Servicio de almuerzo diurno para 9 carreras"]);
    sSubsidios.appendRow(["Refrigerio", "5:30 PM a 8:00 PM", "Servicio de refrigerio nocturno para Admon Financiera y Trabajo Social"]);
    sSubsidios.appendRow(["Ambos", "Diurna y Nocturna", "Estudiantes autorizados para ambos servicios"]);
    sSubsidios.getRange("A1:C1").setBackground("#b45309").setFontColor("#ffffff").setFontWeight("bold");
    sSubsidios.setFrozenRows(1);
  }

  Logger.log("✅ ¡Libro Maestro 1lHMpJKjheEG8sxiKb3K_-vkJrtbsuBBGkOuP5iA0Rcs configurado con éxito!");
}

/**
 * Trae las respuestas de los formularios de Almuerzo y Refrigerio hacia el Libro Maestro
 */
function actualizarRespuestasEnLibroMaestro() {
  const ss = SpreadsheetApp.openById(ID_LIBRO_MAESTRO);
  copiarDatosA(ss, ID_SHEET_ALMUERZO, "Respuestas_Almuerzo");
  copiarDatosA(ss, ID_SHEET_REFRIGERIO, "Respuestas_Refrigerio");
  Logger.log("Respuestas consolidadas con éxito en el Libro Maestro.");
}

function copiarDatosA(ssDestino, idOrigen, nombrePestana) {
  let targetSheet = ssDestino.getSheetByName(nombrePestana) || ssDestino.insertSheet(nombrePestana);
  try {
    const origenSS = SpreadsheetApp.openById(idOrigen);
    const data = origenSS.getSheets()[0].getDataRange().getValues();
    if (data && data.length > 0) {
      targetSheet.clearContents();
      targetSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      targetSheet.getRange(1, 1, 1, data[0].length).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    }
  } catch (err) {
    Logger.log("Error al copiar datos: " + err.message);
  }
}`;
  }

  descargarPlantillaGoogleSheets(): void {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      'Codigo,Nombre,Genero,Carrera,Subsidio,Activo\n' +
      this.beneficiarios().map(b => `${b.codigo},"${b.nombre}",${b.genero},"${b.carrera}",${b.subsidio},${b.activo ? 'SI' : 'NO'}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `plantilla_beneficiarios_guarincito.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export confirmations to CSV file
  exportarConfirmacionesCSV(): void {
    const list = this.confirmadosFiltrados();
    if (list.length === 0) return;

    const headers = ['Fecha', 'Marca Temporal', 'Codigo', 'Nombre', 'Carrera', 'Tipo Subsidio', 'Estado Entrega', 'Hora Entrega', 'En Padron', 'Observaciones'];
    const rows = list.map(c => [
      c.fecha,
      c.timestamp,
      c.codigo,
      `"${c.nombre}"`,
      `"${c.carrera}"`,
      c.tipoSubsidio,
      c.entregado ? 'Entregado' : 'Pendiente',
      c.horaEntrega || '',
      c.esBeneficiarioValido ? 'SI' : 'NO (Extraño)',
      `"${c.observacion || (c.difiereNombre ? 'Difiere nombre del padrón' : '')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `confirmados_cafeteria_${this.filtroFecha()}_${this.filtroSubsidio().toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export delivered raciones to CSV file
  exportarEntregadosCSV(): void {
    const list = this.entregadosFiltrados();
    if (list.length === 0) return;

    const headers = ['Fecha', 'Hora Entrega', 'Codigo ID', 'Nombre Completo', 'Programa Academico', 'Tipo Subsidio', 'Estado', 'Origen Registro', 'Observaciones'];
    const rows = list.map(c => [
      c.fecha,
      c.horaEntrega || c.timestamp,
      c.codigo,
      `"${c.nombre}"`,
      `"${c.carrera}"`,
      c.tipoSubsidio,
      'ENTREGADO',
      c.origen === 'Excepcional' ? 'Ventanilla Excepcional' : 'Formulario Google Sheets',
      `"${c.observacion || (c.difiereNombre ? 'Difiere nombre del padrón' : '')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_entregas_raciones_${this.filtroFecha()}_${this.filtroSubsidio().toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Vaciar todos los datos de prueba / demo para dejar el sistema 100% limpio
  vaciarTodoElSistema(): void {
    this.beneficiarios.set([]);
    this.confirmaciones.set([]);
    this.saveToStorage(STORAGE_KEYS.BENEFICIARIOS, []);
    this.saveToStorage(STORAGE_KEYS.CONFIRMACIONES, []);
    this.lastSyncMessage.set({
      type: 'success',
      text: 'Datos simulados eliminados correctamente. El sistema está 100% limpio y listo para tus datos reales.'
    });
  }

  // Local Storage Helpers
  private saveToStorage<T>(key: string, data: T): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return null;
  }
}
