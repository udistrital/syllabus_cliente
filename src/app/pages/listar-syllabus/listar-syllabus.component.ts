import { Component, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { SyllabusService } from '../services/syllabus.service';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { Syllabus } from '../../@core/models/syllabus';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { VersionesSyllabusComponent } from '../versiones-syllabus/versiones-syllabus.component';
import { VisualizarSyllabusComponent } from '../visualizar-syllabus/visualizar-syllabus.component';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';

@Component({
  selector: 'app-listar-syllabus',
  templateUrl: './listar-syllabus.component.html',
  styleUrls: ['./listar-syllabus.component.scss'],
})
export class ListarSyllabusComponent implements OnInit {
  displayedColumns: string[] = [
    'version',
    'proyecto',
    'plan_estudios',
    'semestre',
    'espacio_academico',
    'acciones_buttons',
  ];
  displayedHeaders: string[] = ['resultadosConsulta', 'acciones'];
  dataSource = new MatTableDataSource<SyllabusInterface>();
  syllabus: Syllabus[] = [];
  syllabusData: SyllabusInterface[];
  canEdit: boolean;
  Proyecto!: ProyectoAcademico;
  PlanEstudio!: PlanEstudio;
  EspacioAcademico!: EspacioAcademico;
  Syllabus: Syllabus;
  SyllabusLoad: boolean;
  hasSyllabusByProjectPlan: boolean;

  constructor(
    private router: Router,
    private syllabusService: SyllabusService,
    private request: RequestManager,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.SyllabusLoad = false;
    this.syllabusService.proyectoAcademico$.subscribe((proyectoAcademico) => {
      this.Proyecto = proyectoAcademico;
    });
    this.syllabusService.planEstudios$.subscribe((planEstudio) => {
      this.PlanEstudio = planEstudio;
    });
    this.syllabusService.espacioAcademico$.subscribe((espacioAcademico) => {
      this.EspacioAcademico = espacioAcademico;
      this.SyllabusLoad = false;
      this.scrollTablaResultados();
      this.changeDataTableSyllabus();
    });
    this.syllabusService.rolwithEdit$.subscribe((canEdit) => {
      this.canEdit = canEdit;
    });
  }

  changeDataTableSyllabus() {
    this.hasSyllabusByProjectPlan = false;
    this.request
      .get(
        environment.SYLLABUS_CRUD,
        `syllabus?query=espacio_academico_id:${this.EspacioAcademico.asi_cod},syllabus_actual:true,activo:true`
      )
      .subscribe({
        next: (dataSyllabus) => {
          if (dataSyllabus) {
            //console.log(dataSyllabus);
            this.syllabus = dataSyllabus.Data;
            this.SyllabusLoad = true;
            if (this.syllabus.length == 0) {
              this.syllabusData = [];
              this.dataSource.data = this.syllabusData;
              Swal.fire({
                icon: 'warning',
                title: 'Sin syllabus',
                text: 'No se encontraron syllabus para este espacio académico.',
              }).then(() => {
                this.scrollToTable();
              });
            } else {
              this.filterSyllabusByProjectPlan();
              if (this.hasSyllabusByProjectPlan) {
                this.formatDataSyllabusForTable();
              } else {
                Swal.fire({
                  icon: 'warning',
                  title:
                    'El Proyecto / Programa Curricular o Plan de estudios no tiene syllabus asignado',
                  text: 'El espacio académico tiene Syllabus, asignelo al Proyecto y/o plan de estudios.',
                });
                this.formatDataSyllabusForTable();
              }
              this.scrollToTable();
            }
            //this.scrollTablaResultados();
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al traer los syllabus',
          });
        },
        complete: () => {},
      });
  }

  filterSyllabusByProjectPlan() {
    const pen_cra_cod: number = Number(this.PlanEstudio.pen_cra_cod);
    const pen_nro: number = Number(this.PlanEstudio.pen_nro);
    console.log('pen_cra_cod', pen_cra_cod);
    console.log('pen_nro', pen_nro);

    let filteredSyllabus: Syllabus[] = [];
    let proyecto_ids;
    let plan_ids;
    this.syllabus.forEach((value) => {
      console.log(value);
      proyecto_ids = value.proyecto_curricular_ids;
      plan_ids = value.plan_estudios_ids;
      if (
        proyecto_ids != undefined &&
        plan_ids != undefined &&
        proyecto_ids.includes(pen_cra_cod) &&
        plan_ids.includes(pen_nro)
      ) {
        filteredSyllabus.push(value);
      }
    });

    if (filteredSyllabus.length == 0) {
      this.hasSyllabusByProjectPlan = false;
    } else {
      this.hasSyllabusByProjectPlan = true;
      this.syllabus = filteredSyllabus;
    }
  }

  formatDataSyllabusForTable() {
    this.syllabusData = [];
    this.syllabus.forEach((value, index) => {
      this.syllabusData.push({
        version: value.version.toString(),
        proyecto: this.Proyecto.Nombre,
        plan_estudios: `${this.PlanEstudio.cra_nombre} - ${this.PlanEstudio.pen_nro}`,
        semestre: this.EspacioAcademico.pen_sem,
        espacio_academico: this.EspacioAcademico.asi_nombre,
      });
    });
    this.dataSource.data = this.syllabusData;
    this.scrollTablaResultados();
  }

  openSyllabusVersion(row: number) {
    try {
      const dialogRef = this.dialog.open(VersionesSyllabusComponent, {
        width: '80vw', // Set width to 60 percent of view port width
      });
      this.Syllabus = this.syllabus[row];
      this.syllabusService.setSyllabus(this.Syllabus);
      dialogRef.afterClosed().subscribe((result) => {
        //console.log(`Dialog result: ${result}`);
      });
    } catch (error) {
      //console.log(error);
    }
  }

  openSyllabusVisualizarSyllabusDocument(row: number) {
    try {
      // Abrir el diálogo para visualizar el Syllabus
      const dialogRefViewDocument = this.dialog.open(
        VisualizarSyllabusComponent,
        {
          width: '80vw', // Set width to 80 percent of view port width
          height: '90vh', // Set height to 90 percent of view port height
        }
      );

      // Pasar datos al componente del diálogo
      dialogRefViewDocument.componentInstance.Syllabus = this.syllabus[row];

      // Suscribirse al evento afterClosed del diálogo
      dialogRefViewDocument.afterClosed().subscribe((result) => {
        // Cerrar Swal de carga cuando el diálogo se cierre
        Swal.close();

        // Manejar casos en los que el syllabus no está asignado
        if (!this.hasSyllabusByProjectPlan) {
          Swal.fire({
            icon: 'warning',
            title: 'Syllabus no asignado',
            text:
              'No se encuentra un syllabus asignado al espacio académico ' +
              (this.EspacioAcademico?.asi_nombre || 'especificado') +
              ' en el plan de estudios número ' +
              (this.PlanEstudio?.pen_nro || 'especificado') +
              ' del proyecto académico ' +
              (this.Proyecto?.Nombre || 'especificado') +
              '.',
          });
        }
      });
    } catch (error) {
      console.error(error);
      // Cerrar Swal en caso de error
      Swal.close();
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

  scrollToTable() {
    const formBusqueda = document.getElementById('tablaResultados');
    formBusqueda?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  FormCrearSyllabus(event: Event) {
    if (this.syllabus.length == 0 && this.canEdit) {
      event.preventDefault();
      const formBusqueda = document.getElementById('workspace');
      formBusqueda?.scrollIntoView({ behavior: 'instant', block: 'center' });
      this.syllabusService.setisNew(true);
      this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
    } else {
    }
  }

  validateMultipleOwnerSyllabus() {
    let pen_cra_cod = Number(this.PlanEstudio.pen_cra_cod);
    let pen_nro = Number(this.PlanEstudio.pen_nro);
    if (
      this.Syllabus.proyecto_curricular_ids == undefined ||
      this.Syllabus.proyecto_curricular_ids.length == 0
    ) {
      return false;
    } else if (
      this.Syllabus.proyecto_curricular_ids.includes(pen_cra_cod) &&
      this.Syllabus.proyecto_curricular_ids.length == 1
    ) {
      return false;
    }

    if (
      this.Syllabus.plan_estudios_ids == undefined ||
      this.Syllabus.plan_estudios_ids.length == 0
    ) {
      return false;
    } else if (
      this.Syllabus.plan_estudios_ids.includes(pen_nro) &&
      this.Syllabus.plan_estudios_ids.length == 1
    ) {
      return false;
    }
    return true;
  }

  updateVersionSyllabus(syllabus: any) {
    Swal.fire({
      title: 'Editando Syllabus',
      html: `Por favor espere`,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    this.request
      .put(environment.SYLLABUS_CRUD, 'syllabus', syllabus, syllabus._id)
      .subscribe({
        next: (respuesta: any) => {
          console.log(respuesta);
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Edición exitosa',
          });
          this.changeDataTableSyllabus();
          this.router.navigate(['/buscar_syllabus'], {
            skipLocationChange: true,
          });
        },
        error: (error) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Fallo la edición del syllabus',
          });
        },
      });
  }

  shouldAddSyllabusButton(row: number): boolean {
    let pen_cra_cod = Number(this.PlanEstudio.pen_cra_cod);
    let pen_nro = Number(this.PlanEstudio.pen_nro);
    let syllabusRow = this.syllabus[row];
    if (
      syllabusRow.proyecto_curricular_ids == undefined ||
      syllabusRow.proyecto_curricular_ids.length == 0 ||
      syllabusRow.plan_estudios_ids == undefined ||
      syllabusRow.plan_estudios_ids.length == 0
    ) {
      return true;
    } else if (
      syllabusRow.proyecto_curricular_ids.includes(pen_cra_cod) &&
      syllabusRow.plan_estudios_ids.includes(pen_nro)
    ) {
      return false;
    }
    return true;
  }

  addProjectPlan2Syllabus(row: number) {
    Swal.fire({
      icon: 'warning',
      title: '¿Está seguro de asignar el Syllabus?',
      text: `Va a asignar el Plan ${this.PlanEstudio.cra_nombre} y Proyecto ${this.Proyecto.Nombre}`,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        let pen_cra_cod = Number(this.PlanEstudio.pen_cra_cod);
        let pen_nro = Number(this.PlanEstudio.pen_nro);
        const syllabus: Syllabus = this.syllabus[row];

        if (
          syllabus.proyecto_curricular_ids == undefined ||
          syllabus.proyecto_curricular_ids.length == 0
        ) {
          syllabus.proyecto_curricular_ids = [pen_cra_cod];
        } else if (syllabus.proyecto_curricular_ids.includes(pen_cra_cod)) {
        } else {
          syllabus.proyecto_curricular_ids = syllabus.proyecto_curricular_ids;
          syllabus.proyecto_curricular_ids.push(pen_cra_cod);
        }

        if (
          syllabus.plan_estudios_ids == undefined ||
          syllabus.plan_estudios_ids.length == 0
        ) {
          syllabus.plan_estudios_ids = [pen_nro];
        } else if (syllabus.plan_estudios_ids.includes(pen_nro)) {
        } else {
          syllabus.plan_estudios_ids = syllabus.plan_estudios_ids;
          syllabus.plan_estudios_ids.push(pen_nro);
        }
        this.updateVersionSyllabus(syllabus);
      }
    });
  }

  removeProjectPlan2Syllabus(row: number) {
    Swal.fire({
      icon: 'warning',
      title: '¿Está seguro de remover el Proyecto y Plan del Syllabus?',
      text: `Va a remover el Plan ${this.PlanEstudio.cra_nombre} y Proyecto ${this.Proyecto.Nombre}`,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        let pen_cra_cod = Number(this.PlanEstudio.pen_cra_cod);
        let pen_nro = Number(this.PlanEstudio.pen_nro);
        const syllabus: Syllabus = this.syllabus[row];

        // Eliminación del plan de estudios
        if (syllabus.plan_estudios_ids.includes(pen_nro)) {
          syllabus.plan_estudios_ids = syllabus.plan_estudios_ids.filter(
            (pe_id) => pe_id !== pen_nro
          );

          // Verificar si hay otros planes en el mismo proyecto curricular
          let otherPlansInProject = syllabus.plan_estudios_ids.some((pid) => {
            return this.syllabus.find(
              (s) =>
                s.proyecto_curricular_ids.includes(pen_cra_cod) &&
                s.plan_estudios_ids.includes(pid)
            );
          });

          // Eliminación del proyecto si no hay otros planes asociados al mismo proyecto
          if (!otherPlansInProject) {
            syllabus.proyecto_curricular_ids =
              syllabus.proyecto_curricular_ids.filter(
                (p_id) => p_id !== pen_cra_cod
              );
          }
        }

        this.updateVersionSyllabus(syllabus);
      }
    });
  }

  shouldRemoveSyllabusButton(row: number): boolean {
    let pen_cra_cod = Number(this.PlanEstudio.pen_cra_cod);
    let pen_nro = Number(this.PlanEstudio.pen_nro);
    const syllabusRow = this.syllabus[row];

    if (
      syllabusRow.proyecto_curricular_ids == undefined ||
      syllabusRow.proyecto_curricular_ids.length == 0
    ) {
      return false;
    } else if (
      syllabusRow.proyecto_curricular_ids.includes(pen_cra_cod) &&
      syllabusRow.plan_estudios_ids.includes(pen_nro)
    ) {
      return true;
    }
    return false;
  }

  FormEditSyllabus(row: number) {
    const formBusqueda = document.getElementById('workspace');
    formBusqueda?.scrollIntoView({ behavior: 'instant', block: 'start' });
    this.syllabusService.setisNew(false);
    this.Syllabus = this.syllabus[row];
    this.syllabusService.setSyllabus(this.Syllabus);
    if (this.validateMultipleOwnerSyllabus()) {
      Swal.fire({
        icon: 'warning',
        title: '¿Está seguro de actualizar el Syllabus?',
        text: 'El syllabus que quiere editar pertenece a múltiples proyectos o planes, por lo tanto, la actualización afecta todos.',
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.router.navigate(['/crear_syllabus'], {
            skipLocationChange: true,
          });
        }
      });
    } else {
      this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
    }
  }
}

export interface SyllabusInterface {
  version: string;
  proyecto: string;
  plan_estudios: string;
  semestre: string;
  espacio_academico: string;
}
