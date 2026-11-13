import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { MatStepper } from '@angular/material/stepper';
import { SyllabusService } from '../services/syllabus.service';
import { Facultad } from 'src/app/@core/models/facultad';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { EspacioAcademico, EspacioConSyllabus } from 'src/app/@core/models/espacioAcademico';
import { ListarSyllabusComponent } from '../listar-syllabus/listar-syllabus.component';
import { LocalStorageService } from 'src/app/@core/utils/local_storage.service';
import { VinculacionPrograma } from 'src/app/@core/models/vinculacion';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-buscar-syllabus',
  templateUrl: './buscar-syllabus.component.html',
  styleUrls: ['./buscar-syllabus.component.scss'],
})
export class BuscarSyllabusComponent implements OnInit, AfterViewInit {
  private _onDestroy = new Subject<void>();
  public filterFacultades: ReplaySubject<Facultad[]> = new ReplaySubject<
    Facultad[]
  >(1);
  public filterProyectoCurricular: ReplaySubject<ProyectoAcademico[]> =
    new ReplaySubject<ProyectoAcademico[]>(1);
  public filterPlanesDeEstudio: ReplaySubject<PlanEstudio[]> =
    new ReplaySubject<PlanEstudio[]>(1);
  mostrartabla: boolean = false;
  facultades: Facultad[] = [];
  proyectos_curriculares: ProyectoAcademico[] = [];
  planes_estudio: PlanEstudio[] = [];
  espacios_academicos: EspacioAcademico[] = [];
  espacios_con_syllabus: EspacioConSyllabus[] = [];
  espacios_con_syllabus_ids: Set<number> = new Set<number>();
  espacios_cargados: boolean = false;
  syllabus_plan_cargados: boolean = false;
  facultadSelected!: Facultad;
  facultadSelectedName: string = '';
  proyectoCurricularSelected!: ProyectoAcademico;
  proyectoCurricularSelectedName: string = '';
  planEstudiosSelected!: PlanEstudio;
  planEstudiosSelectedName: string = '';
  formFacultad: FormGroup;
  formProyectoCurricular: FormGroup;
  formPlanEstudios: FormGroup;
  roles: string[];
  dependenciasId: number[];
  previousSearch: boolean;
  programasVinculados: VinculacionPrograma[] = [];
  verTodo: boolean = false;
  facultadesPermitidas: Set<number> = new Set<number>();
  programasPermitidos: Set<number> = new Set<number>();

  @ViewChild('stepper') private myStepper!: MatStepper;
  @ViewChild(ListarSyllabusComponent) tablaResultados!: ListarSyllabusComponent;

  constructor(
    private _formBuilder: FormBuilder,
    private request: RequestManager,
    private syllabusService: SyllabusService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit() {
    this.syllabusService.programasVinculados$.subscribe((programas) => {
      this.programasVinculados = programas;
      this.actualizarAlcance();
    });

    this.syllabusService.verTodo$.subscribe((verTodo) => {
      this.verTodo = verTodo;
      this.actualizarAlcance();
    });

    this.loadFacultades();
    this.formFacultad = this._formBuilder.group({
      facultadCtrl: ['', Validators.required],
      facultadFilterCtrl: [''],
    });
    this.formProyectoCurricular = this._formBuilder.group({
      proyectoCurricularCtrl: ['', Validators.required],
      proyectoCurricularFilterCtrl: [''],
    });
    this.formPlanEstudios = this._formBuilder.group({
      planEstudiosCtrl: ['', Validators.required],
      planEstudiosFilterCtrl: [''],
    });

    this.syllabusService.facultad$.subscribe((facultad) => {
      this.facultadSelected = facultad;
      if (Object.keys(this.facultadSelected).length != 0) {
        this.formFacultad.get('facultadCtrl')?.setValue(this.facultadSelected);
        this.facultadSelectedName = facultad.Nombre;
      }
    });

    this.syllabusService.proyectoAcademico$.subscribe((proyectoAcademico) => {
      this.proyectoCurricularSelected = proyectoAcademico;
      if (Object.keys(this.proyectoCurricularSelected).length != 0) {
        this.formProyectoCurricular
          .get('proyectoCurricularCtrl')
          ?.setValue(this.proyectoCurricularSelected);
        this.proyectoCurricularSelectedName = proyectoAcademico.Nombre;
      }
    });

    this.syllabusService.planEstudios$.subscribe((planEstudio) => {
      this.planEstudiosSelected = planEstudio;
      if (Object.keys(this.planEstudiosSelected).length != 0) {
        this.formPlanEstudios
          .get('planEstudiosCtrl')
          ?.setValue(this.planEstudiosSelected);
        this.planEstudiosSelectedName =
          planEstudio.cra_nombre + ', plan de estudio:' + planEstudio.pen_nro;
      }
    });

    this.syllabusService.espacioAcademico$.subscribe((espacioAcademico) => {
      // El espacio seleccionado se mantiene en el servicio de contexto: el
      // listado de espacios del plan se colapsa cuando hay espacio elegido y
      // reaparece cuando el filtro se limpia.
      if (espacioAcademico && Object.keys(espacioAcademico).length != 0) {
        this.previousSearch = true;
      } else {
        this.previousSearch = false;
      }
    });

    this.syllabusService.proyectosAcademicos$.subscribe(
      (proyectos_academicos) => {
        if (proyectos_academicos.length !== 0) {
          this.proyectos_curriculares = proyectos_academicos;
        }
      }
    );

    this.syllabusService.planesEstudio$.subscribe((planes_estudio) => {
      if (planes_estudio.length !== 0) {
        this.planes_estudio = planes_estudio;
      }
    });

    this.syllabusService.espaciosAcademicos$.subscribe(
      (espacios_academicos) => {
        this.espacios_academicos = espacios_academicos;
      }
    );

    this.dependenciasId = JSON.parse(
      this.localStorage.getData('dependencias_persona_id')!
    )
      ? JSON.parse(this.localStorage.getData('dependencias_persona_id')!)
      : [];

    this.formFacultad
      .get('facultadFilterCtrl')
      ?.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        this.filterFacultades.next(
          this.facultades.filter((facultad) =>
            facultad.Nombre.toLowerCase().includes(value ? value.toLowerCase(): '')
          )
        );
      });

    this.formProyectoCurricular
      .get('proyectoCurricularFilterCtrl')
      ?.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        this.filterProyectoCurricular.next(
          this.proyectos_curriculares.filter((proyecto) =>
            proyecto.Nombre.toLowerCase().includes(value ? value.toLowerCase() : '')
          )
        );
      });

    this.formPlanEstudios
      .get('planEstudiosFilterCtrl')
      ?.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        this.filterPlanesDeEstudio.next(
          this.planes_estudio.filter(
            (plan) =>
              plan.cra_nombre.toLowerCase().includes(value ? value.toLowerCase(): '') ||
              plan.pen_nro.toString().includes(value ? value.toLowerCase() : '')
          )
        );
      });
  }

  ngAfterViewInit() {
    if (this.previousSearch || this.hayPlanSeleccionado()) {
      this.myStepper.steps.forEach((step) => {
        step.completed = true;
      });
      this.MostrarTabla();
    }
  }

  // Hay un plan de estudios seleccionado (aunque no haya espacio elegido):
  // en ese caso la vista debe mostrar el listado de espacios del plan.
  hayPlanSeleccionado(): boolean {
    return (
      this.planEstudiosSelected &&
      Object.keys(this.planEstudiosSelected).length != 0
    );
  }

  MostrarTabla() {
    this.mostrartabla = true;
  }

  actualizarAlcance() {
    this.facultadesPermitidas = new Set(
      this.programasVinculados.map((programa) => programa.PadreOikos)
    );
    this.programasPermitidos = new Set(
      this.programasVinculados.map((programa) => programa.IdOikos)
    );
  }

  loadFacultades() {
    this.request
      .get(
        environment.OIKOS_SERVICE,
        'dependencia?query=DependenciaTipoDependencia.TipoDependenciaId.Id:2'
      )
      .subscribe((dataFacultades: any) => {
        if (dataFacultades) {
          this.facultades = this.filtrarFacultadesPorVinculacion(dataFacultades);
          this.filterFacultades.next(this.facultades);
        }
      });
  }

  private filtrarFacultadesPorVinculacion(facultades: Facultad[]): Facultad[] {
    if (this.verTodo) {
      return facultades;
    }
    return facultades.filter((facultad) =>
      this.facultadesPermitidas.has(facultad.Id)
    );
  }

  loadProyectosCurriculares() {
    this.request
      .get(
        environment.OIKOS_SERVICE,
        'dependencia/proyectosPorFacultad/' + this.facultadSelected.Id
      )
      .subscribe({
        next: (dataProyectosCurriculares: any) => {
          if (dataProyectosCurriculares) {
            this.proyectos_curriculares = dataProyectosCurriculares;
            this.filterProyectoCurricular.next(this.proyectos_curriculares);
            this.filtrarDependencias();
          }
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al traer los proyectos académicos',
          }).then(() => {
            this.myStepper.previous();
          });
        },
      });
  }

  loadPlanEstudios() {
    this.request
      .get(
        environment.HOMOLOGACION_DEP_JBPM_SERVICE,
        'proyecto_curricular_oikos/' + this.proyectoCurricularSelected.Id
      )
      .subscribe({
        next: (dataHomologacionDep: any) => {
          if (dataHomologacionDep) {
            this.request
              .get(
                environment.ACADEMICA_JBPM_SERVICE,
                'planes_estudio_proyecto/' +
                  dataHomologacionDep.homologacion.codigo_proyecto
              )
              .subscribe({
                next: (dataPlanEstudio) => {
                  if (dataPlanEstudio) {
                    this.planes_estudio =
                      dataPlanEstudio.planes_estudio.plan_estudio;
                    this.syllabusService.setPlanesEstudio(this.planes_estudio);
                    this.filterPlanesDeEstudio.next(this.planes_estudio);
                  }
                },
                error: (error) => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al traer los planes de estudio',
                  }).then(() => {
                    this.myStepper.previous();
                  });
                },
              });
          }
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al traer los planes de estudio',
          }).then(() => {
            this.myStepper.previous();
          });
        },
      });
  }

  loadEspaciosAcademicos() {
    const pen_nro = this.planEstudiosSelected.pen_nro;
    const pen_cra_cod = this.planEstudiosSelected.pen_cra_cod;
    this.request
      .get(
        environment.ACADEMICA_JBPM_SERVICE,
        'espacios_academicos_proyecto/' + pen_nro + '/' + pen_cra_cod
      )
      .subscribe({
        next: (dataEspaciosAcademicosProyecto: any) => {
          // Se descarta la respuesta si el plan seleccionado ya cambió.
          if (!this.esPlanSeleccionado(pen_nro, pen_cra_cod)) {
            return;
          }
          if (dataEspaciosAcademicosProyecto) {
            this.espacios_academicos =
              dataEspaciosAcademicosProyecto.espacios_academicos.espacio_academico;
            this.syllabusService.setEspaciosAcademicos(
              this.espacios_academicos
            );
            this.espacios_cargados = true;
            this.actualizarEspaciosConSyllabus();
          }
        },
        error: () => {
          this.espacios_cargados = true;
          this.actualizarEspaciosConSyllabus();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al traer los espacios académicos',
          }).then(() => {
            this.myStepper.previous();
          });
        },
      });
  }

  /**
   * Consulta el CRUD de syllabus por plan de estudios para conocer qué espacios
   * del plan ya tienen syllabus registrado. Es una única petición (no una por
   * espacio) y se realiza al seleccionar el plan de estudios.
   *
   * Sin estado explicito el CRUD excluye los syllabus en estado borrador
   * (asignado, en_revision, rechazado, expirado), de modo que el indicador
   * refleja los mismos syllabus que muestra la tabla de resultados.
   */
  loadSyllabusPorPlan(planEstudio: PlanEstudio) {
    const pen_nro = planEstudio.pen_nro;
    const pen_cra_cod = planEstudio.pen_cra_cod;
    const query = encodeURIComponent(
      `plan_estudios_id:${pen_nro},syllabus_actual:true,activo:true`
    );
    this.request
      .get(
        environment.SYLLABUS_CRUD,
        `syllabus?query=${query}&fields=espacio_academico_id&limit=150`
      )
      .subscribe({
        next: (dataSyllabus: any) => {
          // Se descarta la respuesta si el plan seleccionado ya cambió.
          if (!this.esPlanSeleccionado(pen_nro, pen_cra_cod)) {
            return;
          }
          const lista: any[] =
            dataSyllabus && dataSyllabus.Data ? dataSyllabus.Data : [];
          const ids = new Set<number>();
          lista.forEach((item: any) => {
            const id = Number(item.espacio_academico_id);
            if (!isNaN(id)) {
              ids.add(id);
            }
          });
          this.espacios_con_syllabus_ids = ids;
          this.syllabus_plan_cargados = true;
          this.actualizarEspaciosConSyllabus();
        },
        error: () => {
          // Sin indicador, pero el listado de espacios sigue disponible.
          this.espacios_con_syllabus_ids = new Set<number>();
          this.syllabus_plan_cargados = true;
          this.actualizarEspaciosConSyllabus();
        },
      });
  }

  // Verifica que el plan de la respuesta siga siendo el plan seleccionado.
  private esPlanSeleccionado(pen_nro: string, pen_cra_cod: string): boolean {
    return (
      !!this.planEstudiosSelected &&
      this.planEstudiosSelected.pen_nro === pen_nro &&
      this.planEstudiosSelected.pen_cra_cod === pen_cra_cod
    );
  }

  /**
   * Cruza los espacios académicos del plan con los que ya tienen syllabus
   * registrado y publica el listado. Es idempotente: se puede invocar cuando
   * llegue cualquiera de las dos respuestas (espacios o syllabus del plan).
   */
  private actualizarEspaciosConSyllabus() {
    this.espacios_con_syllabus = this.espacios_academicos.map((espacio) => ({
      espacio,
      tieneSyllabus: this.espacios_con_syllabus_ids.has(Number(espacio.asi_cod)),
    }));
    this.syllabusService.setEspaciosConSyllabus({
      espacios: this.espacios_con_syllabus,
      cargando: !(this.espacios_cargados && this.syllabus_plan_cargados),
    });
  }

  // Limpia el filtro de espacio académico (el listado de espacios vuelve a verse).
  private limpiarEspacioAcademico() {
    this.syllabusService.setEspacioAcademico(new EspacioAcademico());
  }

  private limpiarEspaciosConSyllabus() {
    this.espacios_academicos = [];
    this.espacios_con_syllabus_ids = new Set<number>();
    this.espacios_con_syllabus = [];
    this.espacios_cargados = false;
    this.syllabus_plan_cargados = false;
    this.syllabusService.setEspaciosAcademicos([]);
    this.syllabusService.setEspaciosConSyllabus({
      espacios: [],
      cargando: true,
    });
  }

  onChangeFacultad(facultad: any) {
    this.syllabusService.setFacultad(facultad);
    this.facultadSelectedName = facultad.Nombre;

    // Reset proyecto curricular
    this.proyectoCurricularSelectedName = '';
    this.formProyectoCurricular.reset();
    this.filterProyectoCurricular.next([]);

    // Reset plan de estudios
    this.planEstudiosSelectedName = '';
    this.formPlanEstudios.reset();
    this.filterPlanesDeEstudio.next([]);

    // Reset espacios académicos
    this.limpiarEspacioAcademico();
    this.limpiarEspaciosConSyllabus();

    this.loadProyectosCurriculares();
    this.myStepper.next();
  }

  onChangeProyectoCurricular(proyectoCurricular: any) {
    this.syllabusService.setProyectoAcademico(proyectoCurricular);
    this.proyectoCurricularSelectedName = proyectoCurricular.Nombre;

    // Reset plan de estudios
    this.planEstudiosSelectedName = '';
    this.formPlanEstudios.reset();
    this.filterPlanesDeEstudio.next([]);

    // Reset espacios académicos
    this.limpiarEspacioAcademico();
    this.limpiarEspaciosConSyllabus();

    this.loadPlanEstudios();
    this.myStepper.next();
  }

  onChangePlanEstudios(planEstudio: any) {
    this.syllabusService.setPlanEstudios(planEstudio);
    this.planEstudiosSelectedName =
      planEstudio.cra_nombre + ', plan de estudio:' + planEstudio.pen_nro;

    // Reset espacios académicos: se limpia el filtro y el listado con indicadores
    this.limpiarEspacioAcademico();
    this.limpiarEspaciosConSyllabus();

    // Espacios del plan (academica) y syllabus del plan (CRUD) en paralelo
    this.loadEspaciosAcademicos();
    this.loadSyllabusPorPlan(planEstudio);

    // El listado de espacios vive en la tabla de resultados de búsqueda.
    this.MostrarTabla();
  }

  filtrarDependencias() {
    if (!this.verTodo) {
      this.proyectos_curriculares = this.proyectos_curriculares.filter(
        (proyecto) => this.programasPermitidos.has(proyecto.Id)
      );
      this.filterProyectoCurricular.next(this.proyectos_curriculares);

      if (this.proyectos_curriculares.length == 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin proyectos relacionados',
          text: 'No se encontraron proyectos relacionados de esta facultad',
        }).then(() => {
          this.myStepper.previous();
          this.myStepper.reset();
        });
      }
    }
    this.syllabusService.setProyectosAcademicos(this.proyectos_curriculares);
  }

  compareFacultad(f1: Facultad, f2: Facultad): boolean {
    if (!f1 || !f2) {
      return false;
    }
    return f1.Nombre === f2.Nombre && f1.Id === f2.Id;
  }

  compareProyectoAcademico(pa1: ProyectoAcademico, pa2: ProyectoAcademico) {
    if (!pa1 || !pa2) {
      return false;
    }
    return pa1.Nombre === pa2.Nombre && pa1.Id === pa2.Id;
  }

  comparePlanEstudio(pe1: PlanEstudio, pe2: PlanEstudio) {
    if (!pe1 || !pe2) {
      return false;
    }
    return pe1.pen_cra_cod === pe2.cra_nombre && pe1.pen_nro === pe2.pen_nro;
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
