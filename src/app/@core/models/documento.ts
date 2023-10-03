export class Documento {
    Descripcion: string;
    Enlace: string;
    Id: number;
    Metadatos: string;
    Nombre: string;
    Activo: boolean;
    TipoDocumento: TipoDocumento;
}

export class TipoDocumento {
    Id: number;
    Nombre: string;
  }