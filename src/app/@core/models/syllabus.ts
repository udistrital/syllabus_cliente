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
  estrategias: {
    tradicional: boolean;
    basado_problemas: boolean;
    aprendizaje_activo: boolean;
    basado_proyectos: boolean;
    colaborativo: boolean;
    autodirigido: boolean;
    basado_tecnologia: boolean;
    basado_experiencias: boolean;
    centrado_estudiante: boolean;
  };
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

export class ResultadoAprendizaje {
  id: string;
  dominio: string;
  resultado_detallado: string;
}

export class PFA {
  competencia: string;
  resultados: ResultadoAprendizaje[];
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

export class Evaluacion {
  tipos_evaluacion: TipoEvaluacion[]
}

export class TipoEvaluacion {
  nombre: string
  tipo_evaluacion: string
  porcentaje: number
  trabajo_tipo: string
  tipo_nota: string
  resultados_aprendizaje_asociados: string[]
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