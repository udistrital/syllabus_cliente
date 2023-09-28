import { Component, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { SyllabusService } from '../services/syllabus.service';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { Syllabus } from '../../@core/models/syllabus'
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { VersionesSyllabusComponent } from '../versiones-syllabus/versiones-syllabus.component';
import { VisualizarSyllabusComponent } from '../visualizar-syllabus/visualizar-syllabus.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-syllabus',
  templateUrl: './listar-syllabus.component.html',
  styleUrls: ['./listar-syllabus.component.scss']
})
export class ListarSyllabusComponent implements OnInit {
  displayedColumns: string[] = ['#', 'proyecto', 'plan_estudios', 'semestre', 'espacio_academico', 'acciones_buttons'];
  displayedHeaders: string[] = ['resultadosConsulta', 'acciones'];
  dataSource = new MatTableDataSource<SyllabusInterface>();
  syllabus: Syllabus[] = [];
  syllabusData: SyllabusInterface[];

  Proyecto!: ProyectoAcademico;
  PlanEstudio!: PlanEstudio;
  EspacioAcademico!: EspacioAcademico;
  Syllabus: Syllabus;
  //SyllabusLoad:BehaviorSubject<boolean> = new BehaviorSubject(false);;

  constructor(private router: Router, private syllabusService: SyllabusService, private request: RequestManager, public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.syllabusService.proyectoAcademico$.subscribe((proyectoAcademico) => {
      this.Proyecto = proyectoAcademico;
    });
    this.syllabusService.planEstudios$.subscribe((planEstudio) => {
      this.PlanEstudio = planEstudio;
    });
    this.syllabusService.espacioAcademico$.subscribe((espacioAcademico) => {
      this.EspacioAcademico = espacioAcademico;
      this.changeDataTableSyllabus();
    });

  }

  changeDataTableSyllabus() {
    this.request.get(environment.SYLLABUS_CRUD, `syllabus?query=espacio_academico_id:${this.EspacioAcademico.asi_cod},proyecto_curricular_id:${this.PlanEstudio.pen_cra_cod},plan_estudios_id:${this.PlanEstudio.pen_nro},syllabus_actual:true,activo:true`).subscribe({
      next:(dataSyllabus) => {
        if (dataSyllabus) {
          //consol.log(dataSyllabus);
          this.syllabus = dataSyllabus.Data;
          //this.SyllabusLoad.next(true);
          this.formatDataSyllabusForTable();
        }
      },
      error:() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al traer los syllabus',
        })
      },
      complete:()=> {
        //consol.log('hola');
        this.scrollTablaResultados();
      }
    })

  }

  formatDataSyllabusForTable() {
    this.syllabusData = [];
    this.syllabus.forEach((value, index) => {
      this.syllabusData.push({ numero: (index + 1).toString(10), proyecto: this.Proyecto.Nombre, plan_estudios: `${this.PlanEstudio.cra_nombre} - ${this.PlanEstudio.pen_nro}`, semestre: this.EspacioAcademico.pen_sem, espacio_academico: this.EspacioAcademico.asi_nombre })
    })
    this.dataSource.data = this.syllabusData;
    this.scrollTablaResultados();
  }

  openSyllabusVersion(row: number) {
    try {
      const dialogRef = this.dialog.open(VersionesSyllabusComponent, {
        width: '80vw',   // Set width to 60 percent of view port width
      });
      this.Syllabus = this.syllabus[row];
      this.syllabusService.setSyllabus(this.Syllabus);
      dialogRef.afterClosed().subscribe(result => {
        //console.log(`Dialog result: ${result}`);
      });
    } catch (error) {
      //console.log(error);
    }
  }

  openSyllabusVisualizarSyllabusDocument(row: number) {
    try {
      const dialogRefViewDocument = this.dialog.open(VisualizarSyllabusComponent, {
        width: '80vw',   // Set width to 60 percent of view port width
        height: '90vh',
      });
      this.Syllabus = this.syllabus[row];
      this.syllabusService.setSyllabus(this.Syllabus);
      dialogRefViewDocument.afterClosed().subscribe(result => {
        //console.log(`Dialog result: ${result}`);
      });
    } catch (error) {
      //console.log(error);
    }
  }

  scrollTablaResultados() {
    const tablaResultados = document.getElementById('tablaResultados');
    //consol.log(tablaResultados);
    tablaResultados?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  scrollFormBuscar() {
    const formBusqueda = document.getElementById('formBusqueda');
    formBusqueda?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  }

  FormCrearSyllabus(event: Event) {
    //console.log(event);
    if (this.syllabus.length == 0) {
      event.preventDefault();
      const formBusqueda = document.getElementById("workspace");
      formBusqueda?.scrollIntoView({ behavior: 'instant', block: 'start' });
      this.syllabusService.setisNew(true);
      this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
    }
  }

  FormEditSyllabus(row: number) {
    const formBusqueda = document.getElementById("workspace");
    formBusqueda?.scrollIntoView({ behavior: 'instant', block: 'start' });
    this.syllabusService.setisNew(false);
    this.Syllabus = this.syllabus[row];
    this.syllabusService.setSyllabus(this.Syllabus);
    this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
  }
}

export interface SyllabusInterface {
  numero: string,
  proyecto: string;
  plan_estudios: string;
  semestre: string;
  espacio_academico: string;
}

const SYLLABUS_DATA: SyllabusInterface[] = [
  { numero: '1', proyecto: 'proyecto 1', plan_estudios: 'plan estudios 1', semestre: '2023-3', espacio_academico: 'espacio 1' },
  { numero: '2', proyecto: 'proyecto 2', plan_estudios: 'plan estudios 2', semestre: '2023-3', espacio_academico: 'espacio 2' },
  { numero: '3', proyecto: 'proyecto 3', plan_estudios: 'plan estudios 3', semestre: '2023-3', espacio_academico: 'espacio 3' },
  { numero: '4', proyecto: 'proyecto 4', plan_estudios: 'plan estudios 4', semestre: '2023-3', espacio_academico: 'espacio 4' },
  { numero: '5', proyecto: 'proyecto 5', plan_estudios: 'plan estudios 5', semestre: '2023-3', espacio_academico: 'espacio 5' },
]
