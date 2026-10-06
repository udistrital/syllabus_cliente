export interface VinculacionRequest {
  NombreCompleto: string;
  Identificacion: string;
  Activo: boolean;
}

export interface VinculacionPrograma {
  IdOikos: number;
  Codigo: number;
  Nombre: string;
  CorreoElectronico: string;
  Coordinador: string;
  Identificacion: string;
  PadreOikos: number;
}
