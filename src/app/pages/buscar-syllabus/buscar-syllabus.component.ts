import { Component, ViewChild,ElementRef, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { MatStepper } from '@angular/material/stepper';
import { SyllabusService } from '../services/syllabus.service';
import { Facultad } from 'src/app/@core/models/facultad';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { ListarSyllabusComponent } from '../listar-syllabus/listar-syllabus.component';


interface Opcion {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-buscar-syllabus',
  templateUrl: './buscar-syllabus.component.html',
  styleUrls: ['./buscar-syllabus.component.scss']
})
export class BuscarSyllabusComponent implements OnInit{
  mostrartabla: boolean = false;
  facultades: Facultad[] = [];
  proyectos_curriculares: ProyectoAcademico[] = [];
  planes_estudio: PlanEstudio[] = [];
  espacios_academicos: EspacioAcademico[] = [];
  facultadSelected!:Facultad;
  facultadSelectedName: string = "";
  proyectoCurricularSelected!:ProyectoAcademico;
  proyectoCurricularSelectedName: string = "";
  planEstudiosSelected!:PlanEstudio;
  planEstudiosSelectedName: string = "";
  espacioAcademicoSelected!:EspacioAcademico;
  espacioAcademicoSelectedName: string = "";
  formFacultad: FormGroup = this._formBuilder.group({
    facultadCtrl: ['', Validators.required]
  });
  formProyectoCurricular: FormGroup = this._formBuilder.group({
    proyectoCurricularCtrl: ['', Validators.required]
  });
  formPlanEstudios: FormGroup = this._formBuilder.group({
    planEstudiosCtrl: ['', Validators.required]
  });
  formEspaciosAcademicos: FormGroup = this._formBuilder.group({
    espaciosAcademicosCtrl: ['', Validators.required]
  });

  @ViewChild('stepper') private myStepper!: MatStepper;
  @ViewChild(ListarSyllabusComponent) tablaResultados!: ListarSyllabusComponent;

  constructor(
    private _formBuilder: FormBuilder,
    private request: RequestManager,
    private syllabusService:SyllabusService
  ) {
    this.loadFacultades();
    this.syllabusService.facultad$.subscribe((facultad) => {
     this.facultadSelected = facultad;
   });
   this.syllabusService.proyectoAcademico$.subscribe((proyectoAcademico) => {
     this.proyectoCurricularSelected = proyectoAcademico;
   });
   this.syllabusService.planEstudios$.subscribe((planEstudio) => {
     this.planEstudiosSelected = planEstudio;
   });
   this.syllabusService.espacioAcademico$.subscribe((espacioAcademico) => {
     this.espacioAcademicoSelected = espacioAcademico;
   });
  }

  ngOnInit(){
    
  }

  MostrarTabla() {
    this.mostrartabla = true;
    if(this.tablaResultados) this.tablaResultados.scrollTablaResultados();
  }

  loadFacultades() {
    this.request.get(environment.OIKOS_SERVICE, 'dependencia?query=DependenciaTipoDependencia.TipoDependenciaId.Id:2').subscribe((dataFacultades: any) => {
      if (dataFacultades) {
        this.facultades = dataFacultades;
      }
    })
  }

  loadProyectosCurriculares() {
    this.request.get(environment.OIKOS_SERVICE, 'dependencia/proyectosPorFacultad/' + this.facultadSelected.Id).subscribe((dataProyectosCurriculares: any) => {
      if (dataProyectosCurriculares) {
        this.proyectos_curriculares = dataProyectosCurriculares;
      }
    })
  }

  loadPlanEstudios() {
    this.request.get(environment.HOMOLOGACION_DEP_JBPM_SERVICE, 'proyecto_curricular_oikos/' + this.proyectoCurricularSelected.Id).subscribe((dataHomologacionDep: any) => {
      if (dataHomologacionDep) {
        this.request.get(environment.ACADEMICA_JBPM_SERVICE, 'planes_estudio_proyecto/' + dataHomologacionDep.homologacion.codigo_proyecto).subscribe((dataPlanEstudio) => {
          if (dataPlanEstudio) {
            this.planes_estudio = dataPlanEstudio.planes_estudio.plan_estudio;
          }
        })
      }
    })
  }

  loadEspaciosAcademicos() {
    this.request.get(environment.ACADEMICA_JBPM_SERVICE, 'espacios_academicos_proyecto/' + this.planEstudiosSelected.pen_nro + '/' + this.planEstudiosSelected.pen_cra_cod).subscribe((dataEspaciosAcademicosProyecto: any) => {
      if (dataEspaciosAcademicosProyecto) {
        this.espacios_academicos = dataEspaciosAcademicosProyecto.espacios_academicos.espacio_academico
      }
    })
  }

  onChangeFacultad(facultad: any) {
    this.syllabusService.setFacultad(facultad);
    this.facultadSelectedName = facultad.Nombre;
    this.proyectoCurricularSelectedName = "";
    this.planEstudiosSelectedName = "";
    this.espacioAcademicoSelectedName = "";
    this.loadProyectosCurriculares();
    this.myStepper.next();
  }

  onChangeProyectoCurricular(proyectoCurricular: any) {
    this.syllabusService.setProyectoAcademico(proyectoCurricular);
    this.proyectoCurricularSelectedName = proyectoCurricular.Nombre;
    this.planEstudiosSelectedName = "";
    this.espacioAcademicoSelectedName = "";
    this.loadPlanEstudios();
    this.myStepper.next();
  }

  onChangePlanEstudios(planEstudio: any) {
    this.syllabusService.setPlanEstudios(planEstudio);
    this.planEstudiosSelectedName = planEstudio.cra_nombre + ', plan de estudio:' + planEstudio.pen_nro;
    this.espacioAcademicoSelectedName = "";
    this.loadEspaciosAcademicos();
    this.myStepper.next();
  }

  onChangeEspacioAcademico(espacioAcademico: any) {
    this.syllabusService.setEspacioAcademico(espacioAcademico);
    this.espacioAcademicoSelectedName = espacioAcademico.asi_nombre;
    this.MostrarTabla();
    //if(this.tablaResultados) document.getElementById('formBusqueda')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}
