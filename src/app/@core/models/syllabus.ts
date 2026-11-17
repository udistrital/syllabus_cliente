import { EstadoSyllabus, Flujo } from './flujo';

export class Syllabus {
  _id: string
  syllabus_code: string
  version: number
  syllabus_actual: boolean
  estado?: EstadoSyllabus
  flujo?: Flujo
  espacio_academico_id: number
  proyecto_curricular_ids: number[]
  plan_estudios_ids: number[]
  idioma_espacio_id:number[]
  justificacion: string
  objetivo_general: string
  objetivos_especificos: ObjetivoEspecifico[]
  resultados_aprendizaje: PFA[]
  contenido: Contenido
  evaluacion: Evaluacion
  bibliografia: Bibliografia
  seguimiento: Seguimiento
  sugerencias: any
  recursos_educativos: any
  practicas_academicas: any
  // Campo legado (documentos anteriores). No se envía en el nuevo formato.
  vigencia?: Vigencia
  tercero_id: number
  activo: boolean
  fecha_creacion: Date
  fecha_modificacion: Date
}

// Forma de registro de los propósitos de formación y de aprendizaje.
// El modo se deduce de la forma del contenido: un item con pfa_matriz es
// una matriz y un item con pfa_programa es un listado.
export type PFAModo = 'listado' | 'matriz';

export class PFA {
  // Modo listado: un propósito por fila.
  pfa_programa?: string
  // Modo matriz: HTML de la tabla de propósitos.
  pfa_matriz?: string
}

export class Contenido {
  descripcion?: string
  imagen_id?: string
}

export class ObjetivoEspecifico{
  objetivo:string
}

export class Evaluacion {
  descripcion: string
  evaluaciones: EvaluacionCorte[]
}

export class EvaluacionCorte {
  nombre: string
  porcentaje: number
}

export class Bibliografia {
  basicas: string[]
  complementarias: string[]
  bases: string[]
  paginasWeb: string[]
}

export class Seguimiento {
  elaboro: string
  reviso: string
  aprobo: string
  fecha_elaboro: string
  fechaRevisionConsejo: string | null
  fechaAprobacionConsejo: string | null
  numeroActa: string
  archivo: string | null
}

// Campo legado (documentos anteriores). No se envía en el nuevo formato.
export class Vigencia {
  fechaInicio: string | null
  fechaFin: string | null
}
