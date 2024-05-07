export class Syllabus {
  _id: string
  syllabus_code: string
  version: number
  syllabus_actual: boolean
  espacio_academico_id: number
  proyecto_curricular_ids: number[]
  plan_estudios_ids: number[]
  idioma_espacio_id:number[]
  justificacion: string
  objetivo_general: string
  objetivos_especificos: ObjetivoEspecifico[]
  resultados_aprendizaje: PFA[]
  articulacion_resultados_aprendizaje: string
  contenido: Contenido
  estrategias: Estrategia[]
  evaluacion: Evaluacion
  bibliografia: Bibliografia
  seguimiento: Seguimiento
  sugerencias: any
  recursos_educativos: any
  practicas_academicas: any
  vigencia:Vigencia
  tercero_id: number
  activo: boolean
  fecha_creacion: Date
  fecha_modificacion: Date
}

export class PFA {
  pfa_programa: string
  pfa_asignatura: string
  competencias: string
}

export class Contenido {
  descripcion: string
  temas: Tema[]
}

export class ObjetivoEspecifico{
  objetivo:string
}

export class Tema {
  nombre: string
  subtemas: string[]
}

export class Estrategia {
  //nombre: string
  descripcion: string
  //pertinencia: string
  //articulacion_ra: string

}

export class Evaluacion {
  descripcion: string
  evaluaciones: Evaluaciones[]

}

export class Evaluaciones {
  nombre: string
  estrategia: string
  momento: string
  porcentaje: number

}

export class Bibliografia {
  basicas: string[]
  complementarias: string[]
  paginasWeb: string[]


}

export class Seguimiento {
  elaboracion: string
  fechaRevisionConsejo: string | null
  fechaAprobacionConsejo: string | null
  numeroActa: string
  archivo: string | null
}

export class Vigencia {
  fechaInicio: string | null
  fechaFin: string | null

}