export class EspacioAcademico{
    public asi_nombre:string;
    public pen_sem:string;
    public asi_cod:string;
    public asi_estado:string;

    // constructor(asi_nombre:string,pen_sem:string,asi_cod:string,asi_estado:string){
    //     this.asi_nombre=asi_nombre;
    //     this.pen_sem=pen_sem;
    //     this.asi_cod=asi_cod;
    //     this.asi_estado=asi_estado;
    // }
}

// Listado de espacios académicos de un plan de estudios con el indicador
// de si el espacio ya tiene syllabus registrado.
export interface EspacioConSyllabus {
    espacio: EspacioAcademico;
    tieneSyllabus: boolean;
}

// Listado publicado en el servicio de contexto junto con el estado de carga.
export interface ListadoEspacios {
    espacios: EspacioConSyllabus[];
    cargando: boolean;
}