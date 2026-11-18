import { Syllabus } from '../models/syllabus';

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
