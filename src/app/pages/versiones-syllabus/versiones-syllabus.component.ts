import { Component,OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { SyllabusService } from '../services/syllabus.service';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { Syllabus} from '../../@core/models/syllabus'
import { GestorDocumentalService } from '../services/gestor_documental.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-versiones-syllabus',
  templateUrl: './versiones-syllabus.component.html',
  styleUrls: ['./versiones-syllabus.component.scss']
})
export class VersionesSyllabusComponent implements  OnInit{
  displayedColumns: string[] = ['version','fecha_fin', 'fecha_fin','acciones_buttons'];
  dataSource = new MatTableDataSource<SyllabusVersionInterface>();
  Proyecto:ProyectoAcademico;
  PlanEstudio:PlanEstudio;
  EspacioAcademico:EspacioAcademico;
  Syllabus:Syllabus;
  syllabusVersions:Syllabus[];
  syllabusData:SyllabusVersionInterface[];

  constructor(private gestorDoc:GestorDocumentalService,private syllabusService:SyllabusService,private request:RequestManager,private router:Router){
   
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
    });
    this.syllabusService.syllabus$.subscribe((syllabus) => {
      this.Syllabus = syllabus;
    });
    this.LoadDataTableSyllabusVersions();
  }

  LoadDataTableSyllabusVersions(){
    //console.log(this.Syllabus)
    this.request.get(environment.SYLLABUS_CRUD, `syllabus?query=syllabus_code:${this.Syllabus.syllabus_code},syllabus_actual:false&sortby=version&order=desc`).subscribe((dataSyllabusVersion) => {
      if (dataSyllabusVersion) {
        //console.log(dataSyllabusVersion);
        this.syllabusVersions = dataSyllabusVersion.Data;
        this.formatDataSyllabusVersionsForTable();
      }
    })
  }

  formatDataSyllabusVersionsForTable(){
    this.syllabusData=[];
    //console.log(this.syllabusVersions);
    this.syllabusVersions.forEach((value,index)=> {
      //console.log(typeof value.vigencia.fechaFin)
      this.syllabusData.push({version:value.version, fecha_inicio: String(value.vigencia.fechaInicio).split('T')[0], fecha_fin: String(value.vigencia.fechaFin).split('T')[0]})
    })
    this.dataSource.data=this.syllabusData;
  }

  loadDocumentosRelacionados(row:any){
    Swal.fire({
      title: 'Cargando documento ...',
      html: `Por favor espere`,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    const syllabus=this.syllabusVersions[row]
    this.gestorDoc.getByUUID(syllabus.seguimiento.archivo).subscribe({
      next:(document)=>{
        //console.log(document)
        Swal.close();
        window.open(document);
        
      },
      error:()=>{
        Swal.close();
        Swal.fire({
          icon:'error',
          title:'Error',
          text:'ocurrió un error al cargar el documento'
        })
      }
    });
  }

  EditSyllabus(){
    const formBusqueda = document.getElementById("workspace");
    formBusqueda?.scrollIntoView({ behavior: 'instant', block: 'start' });
    this.syllabusService.setisNew(false);
    this.syllabusService.setSyllabus(this.Syllabus);
    this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
  }
}

export interface SyllabusVersionInterface {
  version:number,
  fecha_inicio: string;
  fecha_fin: string;
}
