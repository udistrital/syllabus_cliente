import { Syllabus } from '../models/syllabus';

// Campos de una propuesta que se pueden copiar al editor de un syllabus real.
// Se excluyen deliberadamente identificación, evaluación, idiomas y seguimiento.
export type ContenidoImportable = Pick<
  Partial<Syllabus>,
  | 'sugerencias'
  | 'justificacion'
  | 'objetivo_general'
  | 'objetivos_especificos'
  | 'resultados_aprendizaje'
  | 'contenido'
  | 'recursos_educativos'
  | 'practicas_academicas'
  | 'bibliografia'
>;

// Datos de identificación que se registran en una propuesta de syllabus.
export interface DatosPropuesta {
  nombre: string;
  creditos: number | null;
}

// Indica si un documento de syllabus es una propuesta, es decir, si fue
// diligenciado para un espacio académico que todavía no existe en Académica.
export function esPropuestaSyllabus(
  syllabus: Partial<Syllabus> | null | undefined
): boolean {
  return !!syllabus && syllabus.es_propuesta === true;
}

// Arma los datos de una propuesta sobre el payload del syllabus: no queda
// asociado a un espacio académico y no se registra como documento publicado.
export function aplicarDatosPropuesta(syllabus: any, datos: DatosPropuesta): any {
  syllabus.espacio_academico_id = 0;
  syllabus.activo = false;
  syllabus.es_propuesta = true;
  syllabus.propuesta_nombre = datos.nombre ?? '';
  syllabus.propuesta_creditos = datos.creditos ?? null;
  return syllabus;
}

// Indica si el documento se debe actualizar en sitio (PUT) en lugar de crear una
// versión nueva (POST). La propuesta es un documento en elaboración y no se
// versiona; los syllabus oficiales conservan el versionado.
export function debeActualizarEnSitio(
  modoPropuesta: boolean,
  esNuevo: boolean,
  idDocumento?: string
): boolean {
  return modoPropuesta && !esNuevo && !!idDocumento;
}

// Copia únicamente los campos que la subissue permite importar. No trasladar
// datos de identificación, evaluación, idiomas, seguimiento ni estado.
export function extraerContenidoPropuesta(
  propuesta: Partial<Syllabus>
): ContenidoImportable {
  return {
    sugerencias: propuesta.sugerencias,
    justificacion: propuesta.justificacion,
    objetivo_general: propuesta.objetivo_general,
    objetivos_especificos: propuesta.objetivos_especificos,
    resultados_aprendizaje: propuesta.resultados_aprendizaje,
    contenido: propuesta.contenido,
    recursos_educativos: propuesta.recursos_educativos,
    practicas_academicas: propuesta.practicas_academicas,
    bibliografia: propuesta.bibliografia,
  };
}
