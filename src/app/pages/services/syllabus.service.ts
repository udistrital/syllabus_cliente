import { Injectable,EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { DependenciaTipoDependencia, Facultad } from 'src/app/@core/models/facultad';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';

@Injectable({
  providedIn: 'root',
})
export class SyllabusService {

  private facultad = new BehaviorSubject<Facultad>(new Facultad);
  private proyectoAcademico = new BehaviorSubject<ProyectoAcademico>(new ProyectoAcademico);
  private planEstudio = new BehaviorSubject<PlanEstudio>(new PlanEstudio);
  private espacioAcademico = new BehaviorSubject<EspacioAcademico>(new EspacioAcademico);

  facultad$=this.facultad.asObservable();
  proyectoAcademico$=this.proyectoAcademico.asObservable();
  planEstudios$=this.planEstudio.asObservable();
  espacioAcademico$=this.espacioAcademico.asObservable();

  constructor() { }

  setFacultad(facultad:Facultad){
    this.facultad.next(facultad);
  }

  setProyectoAcademico(proyectoAcademico:ProyectoAcademico){
    this.proyectoAcademico.next(proyectoAcademico);
  }

  setPlanEstudios(planEstudios:PlanEstudio){

    this.planEstudio.next(planEstudios);
  }

  setEspacioAcademico(espacioAcademico:EspacioAcademico){
    this.espacioAcademico.next(espacioAcademico);
  }
  
}
