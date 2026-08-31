export type TipoSubsidio = 'Almuerzo' | 'Refrigerio' | 'Ambos';
export type SubsidioFiltro = 'Todos' | 'Almuerzo' | 'Refrigerio';
export type Genero = 'Hombre' | 'Mujer' | 'Otro';

export interface Beneficiario {
  codigo: string;
  nombre: string;
  genero: Genero;
  carrera: string;
  subsidio: TipoSubsidio;
  activo: boolean;
  observaciones?: string;
  fechaRegistro?: string;
}

export interface Confirmacion {
  id: string;
  timestamp: string;
  fecha: string; // YYYY-MM-DD
  codigo: string;
  nombre: string;
  carrera: string;
  tipoSubsidio: 'Almuerzo' | 'Refrigerio';
  entregado: boolean;
  horaEntrega?: string;
  esBeneficiarioValido: boolean;
  beneficiarioPadron?: Beneficiario;
  difiereNombre: boolean;
  nombrePadron?: string;
  origen: 'GoogleSheets' | 'Manual' | 'CSV' | 'LiveSync' | 'Excepcional';
  observacion?: string;
}

export interface FormularioConfig {
  id: string;
  nombre: string;
  tipo: 'Almuerzo' | 'Refrigerio';
  urlSheet: string;
  urlForm: string;
  horario: string;
  carrerasDescripcion: string;
  campos: string;
  activo: boolean;
  ultimaSincronizacion?: string;
  totalRespuestasSincronizadas?: number;
}

export interface HorarioServicio {
  id: string;
  nombre: string;
  tipo: 'Almuerzo' | 'Refrigerio' | 'Desayuno';
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  dias: string[];
}

export interface CarreraVisual {
  nombre: string;
  icono: string;
  badgeClass: string;
  pillActive: string;
  pillCount: string;
  color: string;
  jornada: string;
}

export const CARRERAS_REGISTRADAS = [
  'ADMINISTRACIÓN DE EMPRESAS',
  'CONTADURÍA',
  'DERECHO',
  'ECONOMÍA',
  'INGENIERÍA DE SISTEMAS',
  'INGENIERÍA ELECTRÓNICA',
  'INGENIERÍA INDUSTRIAL',
  'LICENCIATURA EN INGLÉS',
  'PSICOLOGÍA',
  'TRABAJO SOCIAL',
  'ADMINISTRACIÓN FINANCIERA'
] as const;

export const CARRERA_VISUAL_MAP: Record<string, CarreraVisual> = {
  'ADMINISTRACIÓN DE EMPRESAS': {
    nombre: 'ADMINISTRACIÓN DE EMPRESAS',
    icono: 'business',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
    pillActive: 'bg-blue-600 text-white',
    pillCount: 'bg-blue-700 text-white',
    color: 'bg-blue-100 text-blue-800',
    jornada: 'Diurno'
  },
  'CONTADURÍA': {
    nombre: 'CONTADURÍA',
    icono: 'account_balance',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    pillActive: 'bg-emerald-600 text-white',
    pillCount: 'bg-emerald-700 text-white',
    color: 'bg-emerald-100 text-emerald-800',
    jornada: 'Diurno'
  },
  'DERECHO': {
    nombre: 'DERECHO',
    icono: 'gavel',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
    pillActive: 'bg-purple-600 text-white',
    pillCount: 'bg-purple-700 text-white',
    color: 'bg-purple-100 text-purple-800',
    jornada: 'Diurno'
  },
  'ECONOMÍA': {
    nombre: 'ECONOMÍA',
    icono: 'show_chart',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    pillActive: 'bg-amber-600 text-white',
    pillCount: 'bg-amber-700 text-white',
    color: 'bg-amber-100 text-amber-800',
    jornada: 'Diurno'
  },
  'INGENIERÍA DE SISTEMAS': {
    nombre: 'INGENIERÍA DE SISTEMAS',
    icono: 'computer',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    pillActive: 'bg-cyan-600 text-white',
    pillCount: 'bg-cyan-700 text-white',
    color: 'bg-cyan-100 text-cyan-800',
    jornada: 'Diurno'
  },
  'INGENIERÍA ELECTRÓNICA': {
    nombre: 'INGENIERÍA ELECTRÓNICA',
    icono: 'memory',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-200',
    pillActive: 'bg-rose-600 text-white',
    pillCount: 'bg-rose-700 text-white',
    color: 'bg-rose-100 text-rose-800',
    jornada: 'Diurno'
  },
  'INGENIERÍA INDUSTRIAL': {
    nombre: 'INGENIERÍA INDUSTRIAL',
    icono: 'settings',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-200',
    pillActive: 'bg-orange-600 text-white',
    pillCount: 'bg-orange-700 text-white',
    color: 'bg-orange-100 text-orange-800',
    jornada: 'Diurno'
  },
  'LICENCIATURA EN INGLÉS': {
    nombre: 'LICENCIATURA EN INGLÉS',
    icono: 'translate',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
    pillActive: 'bg-teal-600 text-white',
    pillCount: 'bg-teal-700 text-white',
    color: 'bg-teal-100 text-teal-800',
    jornada: 'Diurno'
  },
  'PSICOLOGÍA': {
    nombre: 'PSICOLOGÍA',
    icono: 'psychology',
    badgeClass: 'bg-pink-100 text-pink-900 border-pink-200',
    pillActive: 'bg-pink-600 text-white',
    pillCount: 'bg-pink-700 text-white',
    color: 'bg-pink-100 text-pink-800',
    jornada: 'Diurno'
  },
  'TRABAJO SOCIAL': {
    nombre: 'TRABAJO SOCIAL',
    icono: 'groups',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    pillActive: 'bg-indigo-600 text-white',
    pillCount: 'bg-indigo-700 text-white',
    color: 'bg-indigo-100 text-indigo-800',
    jornada: 'Nocturno'
  },
  'ADMINISTRACIÓN FINANCIERA': {
    nombre: 'ADMINISTRACIÓN FINANCIERA',
    icono: 'paid',
    badgeClass: 'bg-lime-100 text-lime-900 border-lime-200',
    pillActive: 'bg-lime-600 text-white',
    pillCount: 'bg-lime-700 text-white',
    color: 'bg-lime-100 text-lime-800',
    jornada: 'Nocturno'
  }
};

export const DEFAULT_CARRERA_VISUAL: CarreraVisual = {
  nombre: 'PROGRAMA ACADÉMICO',
  icono: 'school',
  badgeClass: 'bg-stone-100 text-stone-900 border-stone-200',
  pillActive: 'bg-stone-600 text-white',
  pillCount: 'bg-stone-700 text-white',
  color: 'bg-stone-100 text-stone-800',
  jornada: 'N/A'
};

export function getVisualCarrera(carreraName?: string): CarreraVisual {
  if (!carreraName) return DEFAULT_CARRERA_VISUAL;
  const upper = carreraName.trim().toUpperCase();
  
  // Direct match
  if (CARRERA_VISUAL_MAP[upper]) {
    return CARRERA_VISUAL_MAP[upper];
  }

  // Normalized matching
  for (const [key, visual] of Object.entries(CARRERA_VISUAL_MAP)) {
    if (upper.includes(key) || key.includes(upper)) {
      return visual;
    }
  }

  // Substring checks for short names or variations
  if (upper.includes('SISTEMA')) return CARRERA_VISUAL_MAP['INGENIERÍA DE SISTEMAS'];
  if (upper.includes('ELECTR')) return CARRERA_VISUAL_MAP['INGENIERÍA ELECTRÓNICA'];
  if (upper.includes('INDUST')) return CARRERA_VISUAL_MAP['INGENIERÍA INDUSTRIAL'];
  if (upper.includes('FINANCIER')) return CARRERA_VISUAL_MAP['ADMINISTRACIÓN FINANCIERA'];
  if (upper.includes('EMPRESA') || upper.includes('ADMON')) return CARRERA_VISUAL_MAP['ADMINISTRACIÓN DE EMPRESAS'];
  if (upper.includes('CONTAD')) return CARRERA_VISUAL_MAP['CONTADURÍA'];
  if (upper.includes('DERECH')) return CARRERA_VISUAL_MAP['DERECHO'];
  if (upper.includes('ECONOM')) return CARRERA_VISUAL_MAP['ECONOMÍA'];
  if (upper.includes('INGL') || upper.includes('LICENC')) return CARRERA_VISUAL_MAP['LICENCIATURA EN INGLÉS'];
  if (upper.includes('PSICOL')) return CARRERA_VISUAL_MAP['PSICOLOGÍA'];
  if (upper.includes('TRABAJO') || upper.includes('SOCIAL')) return CARRERA_VISUAL_MAP['TRABAJO SOCIAL'];

  return {
    nombre: carreraName,
    icono: 'school',
    badgeClass: 'bg-stone-100 text-stone-900 border-stone-200',
    pillActive: 'bg-stone-600 text-white',
    pillCount: 'bg-stone-700 text-white',
    color: 'bg-stone-100 text-stone-800',
    jornada: 'N/A'
  };
}
