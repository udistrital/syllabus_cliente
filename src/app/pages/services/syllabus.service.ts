import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { Facultad } from 'src/app/@core/models/facultad';
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
  private proyectosAcademicos = new BehaviorSubject<ProyectoAcademico[]>([]);
  private planesEstudio = new BehaviorSubject<PlanEstudio[]>([]);
  private espaciosAcademicos = new BehaviorSubject<EspacioAcademico[]>([]);
  private syllabus =new BehaviorSubject<Syllabus>(new Syllabus);
  private isNew= new BehaviorSubject<boolean>(false);
  private rolwithEdit= new BehaviorSubject<boolean>(false);

  facultad$=this.facultad.asObservable();
  proyectoAcademico$=this.proyectoAcademico.asObservable();
  planEstudios$=this.planEstudio.asObservable();
  espacioAcademico$=this.espacioAcademico.asObservable();
  proyectosAcademicos$=this.proyectosAcademicos.asObservable();
  planesEstudio$=this.planesEstudio.asObservable();
  espaciosAcademicos$=this.espaciosAcademicos.asObservable();
  syllabus$=this.syllabus.asObservable();
  isNew$=this.isNew.asObservable();
  rolwithEdit$=this.rolwithEdit.asObservable();

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

  setProyectosAcademicos(proyectosAcademicos:ProyectoAcademico[]){
    this.proyectosAcademicos.next(proyectosAcademicos)
  }

  setPlanesEstudio(planesEstudio:PlanEstudio[]){
    this.planesEstudio.next(planesEstudio)
  }

  setEspaciosAcademicos(espaciosAcademicos:EspacioAcademico[]){
    this.espaciosAcademicos.next(espaciosAcademicos)
  }

  setSyllabus(syllabus:Syllabus){
    this.syllabus.next(syllabus);
  }
  
  setisNew(isnew:boolean){
    this.isNew.next(isnew);
  }

  setrolwithEdit(canEdit:boolean){
    this.rolwithEdit.next(canEdit);
  }
}
