export class DependenciaTipoDependencia {
    public Id?:                number;
    public TipoDependenciaId?: TipoDependenciaID;
    public DependenciaId?:     Facultad;

    // constructor(id:number,tipoDependenciaId:TipoDependenciaID,dependenciaId:Facultad){
    //     this.Id=id;
    //     this.TipoDependenciaId=tipoDependenciaId;
    //     this.DependenciaId=dependenciaId;
    // }
}

export class Facultad {
    Id?:                         number;
    Nombre?:                     string;
    TelefonoDependencia?:        string;
    CorreoElectronico?:          string;
    DependenciaTipoDependencia?: DependenciaTipoDependencia[] | null;

    // constructor(id:number,nombre:string,telefonoDependencia:string,correoElectronico:string,dependenciaTipoDependencia:DependenciaTipoDependencia[]){
    //     this.Id=id;
    //     this.Nombre=nombre;
    //     this.TelefonoDependencia=telefonoDependencia;
    //     this.CorreoElectronico=correoElectronico;
    //     this.DependenciaTipoDependencia=dependenciaTipoDependencia;
    // }
}

export class TipoDependenciaID {
    public Id?:     number;
    public Nombre?: string;

    // constructor(id:number,nombre:string){
    //     this.Id=id;
    //     this.Nombre=nombre;
    // }
}
