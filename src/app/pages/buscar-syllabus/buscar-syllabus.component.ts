import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
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
import { LocalStorageService } from 'src/app/@core/utils/local_storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buscar-syllabus',
  templateUrl: './buscar-syllabus.component.html',
  styleUrls: ['./buscar-syllabus.component.scss']
})
export class BuscarSyllabusComponent implements OnInit, AfterViewInit {
  mostrartabla: boolean = false;
  facultades: Facultad[] = [];
  proyectos_curriculares: ProyectoAcademico[] = [];
  planes_estudio: PlanEstudio[] = [];
  espacios_academicos: EspacioAcademico[] = [];
  facultadSelected!: Facultad;
  facultadSelectedName: string = "";
  proyectoCurricularSelected!: ProyectoAcademico;
  proyectoCurricularSelectedName: string = "";
  planEstudiosSelected!: PlanEstudio;
  planEstudiosSelectedName: string = "";
  espacioAcademicoSelected!: EspacioAcademico;
  espacioAcademicoSelectedName: string = "";
  formFacultad: FormGroup;
  formProyectoCurricular: FormGroup;
  formPlanEstudios: FormGroup;
  formEspaciosAcademicos: FormGroup;
  roles: string[];
  dependenciasId: number[];
  previousSearch: boolean;

  @ViewChild('stepper') private myStepper!: MatStepper;
  @ViewChild(ListarSyllabusComponent) tablaResultados!: ListarSyllabusComponent;

  constructor(
    private _formBuilder: FormBuilder,
    private request: RequestManager,
    private syllabusService: SyllabusService,
    private localStorage: LocalStorageService
  ) {

  }

  ngOnInit() {

    this.loadFacultades();
    this.formFacultad = this._formBuilder.group({
      facultadCtrl: ['', Validators.required]
    });
    this.formProyectoCurricular = this._formBuilder.group({
      proyectoCurricularCtrl: ['', Validators.required]
    });
    this.formPlanEstudios = this._formBuilder.group({
      planEstudiosCtrl: ['', Validators.required]
    });
    this.formEspaciosAcademicos = this._formBuilder.group({
      espaciosAcademicosCtrl: ['', Validators.required]
    });

    this.syllabusService.facultad$.subscribe((facultad) => {
      this.facultadSelected = facultad;
      //consol.log(this.facultadSelected);
      if (Object.keys(this.facultadSelected).length != 0) {
        this.formFacultad.get('facultadCtrl')?.setValue(this.facultadSelected);
        this.facultadSelectedName = facultad.Nombre;
      }
    });
    this.syllabusService.proyectoAcademico$.subscribe((proyectoAcademico) => {
      this.proyectoCurricularSelected = proyectoAcademico;
      if (Object.keys(this.proyectoCurricularSelected).length != 0) {
        this.formProyectoCurricular.get('proyectoCurricularCtrl')?.setValue(this.proyectoCurricularSelected);
        this.proyectoCurricularSelectedName = proyectoAcademico.Nombre
      }
    });
    this.syllabusService.planEstudios$.subscribe((planEstudio) => {
      this.planEstudiosSelected = planEstudio;
      if (Object.keys(this.planEstudiosSelected).length != 0) {
        this.formPlanEstudios.get('planEstudiosCtrl')?.setValue(this.planEstudiosSelected);
        this.planEstudiosSelectedName = planEstudio.cra_nombre + ', plan de estudio:' + planEstudio.pen_nro;
      }
    });
    this.syllabusService.espacioAcademico$.subscribe((espacioAcademico) => {
      this.espacioAcademicoSelected = espacioAcademico;
      if (Object.keys(this.espacioAcademicoSelected).length != 0) {
        this.formEspaciosAcademicos.get('espaciosAcademicosCtrl')?.setValue(this.espacioAcademicoSelected);
        this.espacioAcademicoSelectedName = espacioAcademico.asi_nombre;
        this.previousSearch = true;
        // this.myStepper.steps.forEach((step)=> {
        //   step.completed=true;
        // })
      } else {
        this.previousSearch = false;
      }
    });

    this.syllabusService.proyectosAcademicos$.subscribe((proyectos_academicos) => {
      if (proyectos_academicos.length !== 0) {
        //consol.log("proyectos academicos", proyectos_academicos)
        this.proyectos_curriculares = proyectos_academicos;
      }
    })

    this.syllabusService.planesEstudio$.subscribe((planes_estudio) => {
      if (planes_estudio.length !== 0) {
        this.planes_estudio = planes_estudio;
      }
    })

    this.syllabusService.espaciosAcademicos$.subscribe((espacios_academicos) => {
      if (espacios_academicos.length !== 0) {
        this.espacios_academicos = espacios_academicos;
      }
    })
    // console.log('playload', this.implictToken.getPayload());
    // this.implictToken.getRole().then((roleSystem:string[]) => {
    //   if (typeof roleSystem !== 'undefined' && roleSystem !== null) {
    //     console.log('roles',roleSystem);
    //     this.roles=roleSystem;
    //   }
    // })

    this.dependenciasId = JSON.parse(this.localStorage.getData('dependencias_persona_id')!)
  }

  ngAfterViewInit() {
    //consol.log(this.myStepper);
    if (this.previousSearch) {
      this.myStepper.steps.forEach((step) => {
        step.completed = true;
      })
      this.MostrarTabla();
    }
  }

  MostrarTabla() {
    this.mostrartabla = true;
    //if (this.tablaResultados) this.tablaResultados.scrollTablaResultados();
  }

  loadFacultades() {
    this.request.get(environment.OIKOS_SERVICE, 'dependencia?query=DependenciaTipoDependencia.TipoDependenciaId.Id:2').subscribe((dataFacultades: any) => {
      if (dataFacultades) {
        this.facultades = dataFacultades;
      }
    })
  }

  loadProyectosCurriculares() {
    this.request.get(environment.OIKOS_SERVICE, 'dependencia/proyectosPorFacultad/' + this.facultadSelected.Id).subscribe({
      next:(dataProyectosCurriculares: any) => {
        if (dataProyectosCurriculares) {
          this.proyectos_curriculares = dataProyectosCurriculares;
          this.filtrarDependencias();
        }
      },
      error:(error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al traer los proyectos académicos',
        }).then(() => {
          this.myStepper.previous();
        })

      }
    })
  }

  loadPlanEstudios() {
    this.request.get(environment.HOMOLOGACION_DEP_JBPM_SERVICE, 'proyecto_curricular_oikos/' + this.proyectoCurricularSelected.Id).subscribe({
      next:(dataHomologacionDep: any) => {
        if (dataHomologacionDep) {
          this.request.get(environment.ACADEMICA_JBPM_SERVICE, 'planes_estudio_proyecto/' + dataHomologacionDep.homologacion.codigo_proyecto).subscribe({
            next:(dataPlanEstudio) => {
              if (dataPlanEstudio) {
                this.planes_estudio = dataPlanEstudio.planes_estudio.plan_estudio;
                this.syllabusService.setPlanesEstudio(this.planes_estudio);
              }
            },
            error:(error)=>{
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al traer los planes de estudio',
              }).then(() => {
                this.myStepper.previous();
              })
            }
          })
        }
      },
      error:(error)=>{
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al traer los planes de estudio',
        }).then(() => {
          this.myStepper.previous();
        })
      }
    })
  }

  loadEspaciosAcademicos() {
    this.request.get(environment.ACADEMICA_JBPM_SERVICE, 'espacios_academicos_proyecto/' + this.planEstudiosSelected.pen_nro + '/' + this.planEstudiosSelected.pen_cra_cod).subscribe({
      next:(dataEspaciosAcademicosProyecto: any) => {
        if (dataEspaciosAcademicosProyecto) {
          this.espacios_academicos = dataEspaciosAcademicosProyecto.espacios_academicos.espacio_academico;
          this.syllabusService.setEspaciosAcademicos(this.espacios_academicos);
        }
      },
      error:()=> {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al traer los espacios académicos',
        }).then(() => {
          this.myStepper.previous();
        })
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

  filtrarDependencias() {
    var aux_proy = []
    if (this.dependenciasId.length != 0) {
      aux_proy = this.proyectos_curriculares.filter((proyecto) => this.dependenciasId.includes(proyecto.Id))
      this.proyectos_curriculares = aux_proy;

      if (this.proyectos_curriculares.length == 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin proyectos relacionados',
          text: 'No se encontraron proyectos relacionados de esta facultad',
        }).then(() => {
          this.myStepper.previous();
          this.myStepper.reset();
        })

      }
    }
    this.syllabusService.setProyectosAcademicos(this.proyectos_curriculares);
  }

  compareFacultad(f1: Facultad, f2: Facultad): boolean {
    return f1.Nombre === f2.Nombre && f1.Id === f2.Id;
  }

  compareProyectoAcademico(pa1: ProyectoAcademico, pa2: ProyectoAcademico) {
    return pa1.Nombre === pa2.Nombre && pa1.Id === pa2.Id;
  }

  comparePlanEstudio(pe1: PlanEstudio, pe2: PlanEstudio) {
    return pe1.pen_cra_cod === pe2.cra_nombre && pe1.pen_nro === pe2.pen_nro;
  }

  compareEspacioAcademico(ea1: EspacioAcademico, ea2: EspacioAcademico) {
    return ea1.asi_nombre === ea2.asi_nombre && ea1.asi_cod === ea2.asi_cod;
  }
}
