import { Component, OnInit,Input } from '@angular/core';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { SyllabusService } from '../services/syllabus.service';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { Syllabus} from '../../@core/models/syllabus'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-visualizar-syllabus',
  templateUrl: './visualizar-syllabus.component.html',
  styleUrls: ['./visualizar-syllabus.component.scss']
})
export class VisualizarSyllabusComponent implements OnInit{
  Proyecto:ProyectoAcademico;
  PlanEstudio:PlanEstudio;
  EspacioAcademico:EspacioAcademico;
  syllabusDocument:any;
  syllabusDocumentData:string;
  SyllabusDocumentLoad:boolean=false;
  canEdit:boolean;
  @Input() Syllabus:Syllabus;
  
  constructor(private router:Router,private syllabusService:SyllabusService,private request:RequestManager){
   
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
    // this.syllabusService.syllabus$.subscribe((syllabus) => {
    //   this.Syllabus = syllabus;
    // });
    this.syllabusService.rolwithEdit$.subscribe((canEdit) => {
      this.canEdit = canEdit;
    });
    this.getSyllabusDocument();
  }

  getSyllabusDocument(){
    const body:any={
      syllabusCode:this.Syllabus.syllabus_code
    }
    this.Syllabus.syllabus_actual?null:body.version=this.Syllabus.version;
    this.request.post(environment.SGA_MID,'espacios_academicos/syllabus_template',body).subscribe({
      next:(syllabus_document) => {
        if(syllabus_document){
          this.syllabusDocument=syllabus_document.Data.document
          if(this.syllabusDocument){
            this.SyllabusDocumentLoad=true;
            this.syllabusDocumentData="data:application/pdf;base64,"+this.syllabusDocument;
          }
        }
      },
      error: (error)=> {
        //console.error(error);
        Swal.fire({
          icon:'error',
          title:'Error al cargar el syllabus',
        })
      }
    })
  }
  

  DownloadSyllabus(){
    const src = this.syllabusDocumentData;
    const link = document.createElement("a")
    link.href = src
    link.download = `Syllabus_${this.Proyecto.Nombre}_${this.PlanEstudio.pen_nro}_${this.EspacioAcademico.asi_nombre}`
    link.click()
    link.remove()
  }

  DownloadSyllabusXLSX(){
    const body:any={
      syllabusCode:this.Syllabus.syllabus_code,
      format: "xlsx"
    }
    this.Syllabus.syllabus_actual?null:body.version=this.Syllabus.version;
    this.request.post(environment.SGA_MID,'espacios_academicos/syllabus_template',body).subscribe({
      next:(syllabus_document) => {
        if(syllabus_document){
          if(syllabus_document.Data.document){
            const link = document.createElement("a")
            link.href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,"+syllabus_document.Data.document;
            link.download = `Syllabus_${this.Proyecto.Nombre}_${this.PlanEstudio.pen_nro}_${this.EspacioAcademico.asi_nombre}`
            link.click()
            link.remove()
          }
        }
      },
      error: (error)=> {
        //console.error(error);
        Swal.fire({
          icon:'error',
          title:'Error descargando el syllabus en formato XLSX',
        })
      }
    })
  }

  EditSyllabus(){
    const formBusqueda = document.getElementById("workspace");
    formBusqueda?.scrollIntoView({ behavior: 'instant', block: 'start' });
    this.syllabusService.setisNew(false);
    this.syllabusService.setSyllabus(this.Syllabus);
    this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
  }
}
