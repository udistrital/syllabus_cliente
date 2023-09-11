import { ViewportScroller } from '@angular/common';
import { Component,OnInit,AfterViewInit, AfterContentInit} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { SyllabusService } from '../services/syllabus.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-syllabus',
  templateUrl: './listar-syllabus.component.html',
  styleUrls: ['./listar-syllabus.component.scss']
})
export class ListarSyllabusComponent implements AfterViewInit {
  displayedColumns: string[] = ['#','proyecto', 'plan_estudios', 'semestre', 'espacio_academico','acciones_buttons'];
  displayedHeaders: string[] = [ 'resultadosConsulta','acciones'];
  dataSource = new MatTableDataSource<Syllabus>(SYLLABUS_DATA);

  Proyecto!:ProyectoAcademico;
  PlanEstudio!:PlanEstudio;
  EspacioAcademico!:EspacioAcademico;
  
  constructor(private router:Router,private syllabusService:SyllabusService){
    this.syllabusService.proyectoAcademico$.subscribe((proyectoAcademico) => {
      this.Proyecto = proyectoAcademico;
    });
    this.syllabusService.planEstudios$.subscribe((planEstudio) => {
      this.PlanEstudio = planEstudio;
    });
    this.syllabusService.espacioAcademico$.subscribe((espacioAcademico) => {
      this.EspacioAcademico = espacioAcademico;
    });
  }

  ngAfterViewInit() {
    this.scrollTablaResultados();
  }

  scrollTablaResultados(){
    const tablaResultados=document.getElementById('tablaResultados');
    tablaResultados?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  scrollFormBuscar(){
    const formBusqueda=document.getElementById('formBusqueda');
    formBusqueda?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
  }

  FormCrearSyllabus(){
    const formBusqueda=document.getElementById("workspace");
    formBusqueda?.scrollIntoView({ behavior: 'instant', block: 'start' });
    this.router.navigate(['/crear_syllabus']);
  }
}

export interface Syllabus {
  numero:string,
  proyecto: string;
  plan_estudios: string;
  semestre: string;
  espacio_academico: string;
}

const SYLLABUS_DATA: Syllabus[] = [
  {numero:'1', proyecto: 'proyecto 1', plan_estudios: 'plan estudios 1', semestre: '2023-3', espacio_academico: 'espacio 1' },
  {numero:'2', proyecto: 'proyecto 2', plan_estudios: 'plan estudios 2', semestre: '2023-3', espacio_academico: 'espacio 2' },
  {numero:'3', proyecto: 'proyecto 3', plan_estudios: 'plan estudios 3', semestre: '2023-3', espacio_academico: 'espacio 3' },
  {numero:'4', proyecto: 'proyecto 4', plan_estudios: 'plan estudios 4', semestre: '2023-3', espacio_academico: 'espacio 4' },
  {numero:'5', proyecto: 'proyecto 5', plan_estudios: 'plan estudios 5', semestre: '2023-3', espacio_academico: 'espacio 5' },
]
