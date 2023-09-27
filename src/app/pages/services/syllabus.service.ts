import { Injectable,EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { DependenciaTipoDependencia, Facultad } from 'src/app/@core/models/facultad';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { Syllabus } from 'src/app/@core/models/syllabus';

@Injectable({
  providedIn: 'root',
})
export class SyllabusService {

  private facultad = new BehaviorSubject<Facultad>(new Facultad);
  private proyectoAcademico = new BehaviorSubject<ProyectoAcademico>(new ProyectoAcademico);
  private planEstudio = new BehaviorSubject<PlanEstudio>(new PlanEstudio);
  private espacioAcademico = new BehaviorSubject<EspacioAcademico>(new EspacioAcademico);
  private syllabus =new BehaviorSubject<Syllabus>(new Syllabus);
  private isNew= new BehaviorSubject<Boolean>(new Boolean);

  facultad$=this.facultad.asObservable();
  proyectoAcademico$=this.proyectoAcademico.asObservable();
  planEstudios$=this.planEstudio.asObservable();
  espacioAcademico$=this.espacioAcademico.asObservable();
  syllabus$=this.syllabus.asObservable();
  isNew$=this.isNew.asObservable();

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

  setSyllabus(syllabus:Syllabus){
    this.syllabus.next(syllabus);
  }
  
  setisNew(isnew:boolean){
    this.isNew.next(isnew);
  }
}
