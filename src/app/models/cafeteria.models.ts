export type TipoSubsidio = 'Almuerzo' | 'Refrigerio' | 'Desayuno' | 'Ambos';
export type SubsidioFiltro = 'Todos' | 'Almuerzo' | 'Refrigerio' | 'Desayuno';
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
  tipoSubsidio: 'Almuerzo' | 'Refrigerio' | 'Desayuno';
  entregado: boolean;
  horaEntrega?: string;
  esBeneficiarioValido: boolean;
  beneficiarioPadron?: Beneficiario;
  difiereNombre: boolean;
  nombrePadron?: string;
  origen: 'GoogleSheets' | 'Manual' | 'CSV' | 'LiveSync' | 'Excepcional' | 'LibroMaestro';
  observacion?: string;
}

export interface FormularioConfig {
  id: string;
  nombre: string;
  tipo: 'Almuerzo' | 'Refrigerio' | 'Desayuno';
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
  'ADMINISTRACIÓN FINANCIERA',
  'ADEA',
  'REGENCIA',
  'TECNICO EN PROCESOS'
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
  },
  'ING INFORMATICA': {
    nombre: 'ING INFORMATICA',
    icono: 'code',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-200',
    pillActive: 'bg-sky-600 text-white',
    pillCount: 'bg-sky-700 text-white',
    color: 'bg-sky-100 text-sky-800',
    jornada: 'Diurno'
  },
  'INGENIERÍA INFORMÁTICA': {
    nombre: 'INGENIERÍA INFORMÁTICA',
    icono: 'code',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-200',
    pillActive: 'bg-sky-600 text-white',
    pillCount: 'bg-sky-700 text-white',
    color: 'bg-sky-100 text-sky-800',
    jornada: 'Diurno'
  },
  'MEDICINA': {
    nombre: 'MEDICINA',
    icono: 'local_hospital',
    badgeClass: 'bg-red-100 text-red-900 border-red-200',
    pillActive: 'bg-red-600 text-white',
    pillCount: 'bg-red-700 text-white',
    color: 'bg-red-100 text-red-800',
    jornada: 'Diurno'
  },
  'ENFERMERÍA': {
    nombre: 'ENFERMERÍA',
    icono: 'healing',
    badgeClass: 'bg-violet-100 text-violet-900 border-violet-200',
    pillActive: 'bg-violet-600 text-white',
    pillCount: 'bg-violet-700 text-white',
    color: 'bg-violet-100 text-violet-800',
    jornada: 'Diurno'
  },
  'ENFERMERIA': {
    nombre: 'ENFERMERIA',
    icono: 'healing',
    badgeClass: 'bg-violet-100 text-violet-900 border-violet-200',
    pillActive: 'bg-violet-600 text-white',
    pillCount: 'bg-violet-700 text-white',
    color: 'bg-violet-100 text-violet-800',
    jornada: 'Diurno'
  },
  'ING AGRONÓMICA': {
    nombre: 'ING AGRONÓMICA',
    icono: 'eco',
    badgeClass: 'bg-green-100 text-green-900 border-green-200',
    pillActive: 'bg-green-600 text-white',
    pillCount: 'bg-green-700 text-white',
    color: 'bg-green-100 text-green-800',
    jornada: 'Diurno'
  },
  'ING AGRONOMICA': {
    nombre: 'ING AGRONOMICA',
    icono: 'eco',
    badgeClass: 'bg-green-100 text-green-900 border-green-200',
    pillActive: 'bg-green-600 text-white',
    pillCount: 'bg-green-700 text-white',
    color: 'bg-green-100 text-green-800',
    jornada: 'Diurno'
  },
  'INGENIERÍA AGRONÓMICA': {
    nombre: 'INGENIERÍA AGRONÓMICA',
    icono: 'eco',
    badgeClass: 'bg-green-100 text-green-900 border-green-200',
    pillActive: 'bg-green-600 text-white',
    pillCount: 'bg-green-700 text-white',
    color: 'bg-green-100 text-green-800',
    jornada: 'Diurno'
  },
  'AGROINDUSTRIAL': {
    nombre: 'AGROINDUSTRIAL',
    icono: 'agriculture',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
    pillActive: 'bg-teal-600 text-white',
    pillCount: 'bg-teal-700 text-white',
    color: 'bg-teal-100 text-teal-800',
    jornada: 'Diurno'
  },
  'ING ALIMENTOS': {
    nombre: 'ING ALIMENTOS',
    icono: 'restaurant',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200',
    pillActive: 'bg-fuchsia-600 text-white',
    pillCount: 'bg-fuchsia-700 text-white',
    color: 'bg-fuchsia-100 text-fuchsia-800',
    jornada: 'Diurno'
  },
  'INGENIERÍA DE ALIMENTOS': {
    nombre: 'INGENIERÍA DE ALIMENTOS',
    icono: 'restaurant',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200',
    pillActive: 'bg-fuchsia-600 text-white',
    pillCount: 'bg-fuchsia-700 text-white',
    color: 'bg-fuchsia-100 text-fuchsia-800',
    jornada: 'Diurno'
  },
  'ADEA': {
    nombre: 'ADEA',
    icono: 'menu_book',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    pillActive: 'bg-amber-600 text-white',
    pillCount: 'bg-amber-700 text-white',
    color: 'bg-amber-100 text-amber-800',
    jornada: 'Fin de semana'
  },
  'REGENCIA': {
    nombre: 'REGENCIA',
    icono: 'medical_services',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    pillActive: 'bg-cyan-600 text-white',
    pillCount: 'bg-cyan-700 text-white',
    color: 'bg-cyan-100 text-cyan-800',
    jornada: 'Fin de semana'
  },
  'TECNICO EN PROCESOS': {
    nombre: 'TECNICO EN PROCESOS',
    icono: 'biotech',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    pillActive: 'bg-indigo-600 text-white',
    pillCount: 'bg-indigo-700 text-white',
    color: 'bg-indigo-100 text-indigo-800',
    jornada: 'Fin de semana'
  },
  'TECNICO EN SALUD': {
    nombre: 'TECNICO EN SALUD',
    icono: 'biotech',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    pillActive: 'bg-indigo-600 text-white',
    pillCount: 'bg-indigo-700 text-white',
    color: 'bg-indigo-100 text-indigo-800',
    jornada: 'Fin de semana'
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
  if (upper.includes('INFORMAT') || upper.includes('INFORMÁT')) return CARRERA_VISUAL_MAP['ING INFORMATICA'];
  if (upper.includes('MEDIC')) return CARRERA_VISUAL_MAP['MEDICINA'];
  if (upper.includes('ENFERM')) return CARRERA_VISUAL_MAP['ENFERMERIA'];
  if (upper.includes('AGRON') && !upper.includes('AGROIND')) return CARRERA_VISUAL_MAP['ING AGRONOMICA'];
  if (upper.includes('AGROIND')) return CARRERA_VISUAL_MAP['AGROINDUSTRIAL'];
  if (upper.includes('ALIMENT')) return CARRERA_VISUAL_MAP['ING ALIMENTOS'];
  if (upper.includes('ADEA')) return CARRERA_VISUAL_MAP['ADEA'];
  if (upper.includes('REGENC')) return CARRERA_VISUAL_MAP['REGENCIA'];
  if (upper.includes('TECNICO') && (upper.includes('PROCESO') || upper.includes('SALUD'))) return CARRERA_VISUAL_MAP['TECNICO EN PROCESOS'];
  if (upper.includes('TECNICO')) return CARRERA_VISUAL_MAP['TECNICO EN PROCESOS'];

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
