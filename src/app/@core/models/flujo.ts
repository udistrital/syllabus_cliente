export type EstadoSyllabus =
  | 'activo'
  | 'asignado'
  | 'en_revision'
  | 'rechazado'
  | 'expirado'
  | 'cancelado'
  | 'aprobado';

export interface HistorialEstado {
  estado: string;
  fecha?: string;
  tercero_id?: number;
  tercero_documento?: string;
  observacion?: string;
}

export interface Flujo {
  asignado_a?: number;
  asignado_a_documento?: string;
  asignado_por?: number;
  asignado_por_documento?: string;
  fecha_asignacion?: string;
  fecha_limite?: string;
  fecha_envio?: string;
  fecha_ultima_decision?: string;
  ultima_decision_por?: number;
  motivo_rechazo?: string;
  historial?: HistorialEstado[];
}

export interface AsignarRequest {
  documento?: string;
  documento_docente: string;
  fecha_limite: string;
  syllabus_code?: string;
  espacio_academico_id?: number;
  proyecto_curricular_ids?: number[];
  plan_estudios_ids?: number[];
  observacion?: string;
}

export interface TransicionRequest {
  documento?: string;
  observacion?: string;
  fecha_limite?: string;
  motivo_rechazo?: string;
  numeroActa?: string;
  archivo?: string;
}

export interface Docente {
  Id: number;
  NombreCompleto: string;
  UsuarioWSO2?: string;
}
