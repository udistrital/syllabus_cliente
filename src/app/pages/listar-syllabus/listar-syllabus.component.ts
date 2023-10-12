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
  displayedColumns: string[] = ['version', 'proyecto', 'plan_estudios', 'semestre', 'espacio_academico', 'acciones_buttons'];
  displayedHeaders: string[] = ['resultadosConsulta', 'acciones'];
  dataSource = new MatTableDataSource<SyllabusInterface>();
  syllabus: Syllabus[] = [];
  syllabusData: SyllabusInterface[];
  canEdit:boolean;
  Proyecto!: ProyectoAcademico;
  PlanEstudio!: PlanEstudio;
  EspacioAcademico!: EspacioAcademico;
  Syllabus: Syllabus;
  SyllabusLoad:boolean;

  constructor(private router: Router, private syllabusService: SyllabusService, private request: RequestManager, public dialog: MatDialog) {

  }

  ngOnInit(): void {
    
    this.SyllabusLoad=false;
    this.syllabusService.proyectoAcademico$.subscribe((proyectoAcademico) => {
      this.Proyecto = proyectoAcademico;
    });
    this.syllabusService.planEstudios$.subscribe((planEstudio) => {
      this.PlanEstudio = planEstudio;
    });
    this.syllabusService.espacioAcademico$.subscribe((espacioAcademico) => {
      this.EspacioAcademico = espacioAcademico;
      this.SyllabusLoad=false;
      this.scrollTablaResultados();
      this.changeDataTableSyllabus();
    });
    this.syllabusService.rolwithEdit$.subscribe((canEdit) => {
      this.canEdit = canEdit;
    });
  }

  changeDataTableSyllabus() {
    this.request.get(environment.SYLLABUS_CRUD, `syllabus?query=espacio_academico_id:${this.EspacioAcademico.asi_cod},proyecto_curricular_id:${this.PlanEstudio.pen_cra_cod},plan_estudios_id:${this.PlanEstudio.pen_nro},syllabus_actual:true,activo:true`).subscribe({
      next:(dataSyllabus) => {
        if (dataSyllabus) {
          //consol.log(dataSyllabus);
          this.syllabus = dataSyllabus.Data;
          this.SyllabusLoad=true;
          if(this.syllabus.length==0){
            this.syllabusData = [];
            this.dataSource.data=this.syllabusData;
            Swal.fire({
              icon: 'warning',
              title: 'Sin syllabus',
              text: 'No se encontraron syllabus para este espacio académico.',
            }).then(()=>{
              this.scrollFormBuscar();
            })
          }else{
            this.formatDataSyllabusForTable();
          }
          //this.scrollTablaResultados();
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
        
      }
    })

  }

  formatDataSyllabusForTable() {
    this.syllabusData = [];
    this.syllabus.forEach((value, index) => {
      this.syllabusData.push({ version: value.version.toString(), proyecto: this.Proyecto.Nombre, plan_estudios: `${this.PlanEstudio.cra_nombre} - ${this.PlanEstudio.pen_nro}`, semestre: this.EspacioAcademico.pen_sem, espacio_academico: this.EspacioAcademico.asi_nombre })
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
      dialogRefViewDocument.componentInstance.Syllabus=this.syllabus[row];
      dialogRefViewDocument.afterClosed().subscribe(result => {
        //console.log(`Dialog result: ${result}`);
      });
    } catch (error) {
      //console.log(error);
    }
  }

  scrollTablaResultados() {
    const tablaResultados = document.getElementById('tablaResultados');
    tablaResultados?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  scrollFormBuscar() {
    const formBusqueda = document.getElementById('formBusqueda');
    formBusqueda?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  }

  FormCrearSyllabus(event: Event) {
    if (this.syllabus.length == 0 && this.canEdit) {
      event.preventDefault();
      const formBusqueda = document.getElementById("workspace");
      formBusqueda?.scrollIntoView({ behavior: 'instant', block: 'start' });
      this.syllabusService.setisNew(true);
      this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
    }else{
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
  version: string,
  proyecto: string;
  plan_estudios: string;
  semestre: string;
  espacio_academico: string;
}
