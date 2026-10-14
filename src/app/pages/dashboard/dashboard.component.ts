import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../services/userService';
import { SyllabusService } from '../services/syllabus.service';
import { FlujoService } from '../services/flujo.service';
import { AprobacionComponent } from '../aprobacion/aprobacion.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  puedeBuscar = false;
  esCoordinador = false;
  esDocente = false;
  esVistaGlobal = false;
  cargando = true;
  documento = '';
  asignaciones: any[] = [];
  pendientes: any[] = [];
  columnasDocente: string[] = ['espacio', 'estado', 'fecha_limite', 'motivo', 'acciones'];
  columnasCoordinador: string[] = ['espacio', 'docente', 'estado', 'fecha_limite', 'acciones'];

  constructor(
    private router: Router,
    private userService: UserService,
    private syllabusService: SyllabusService,
    private flujoService: FlujoService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const role = this.userService.getPayload()?.role || [];
    this.esVistaGlobal = role.includes('ASESOR_VICE') || role.includes('VICERRECTOR');

    this.userService.terceroListo$
      .pipe(filter((listo: boolean) => listo), take(1))
      .subscribe(() => this.inicializar());
  }

  private inicializar(): void {
    const datos = this.userService.getDatosVinculacion();
    this.documento =
      this.userService.getPayload()?.documento ||
      (datos ? datos.Identificacion : '') ||
      '';
    this.flujoService.setDocumento(this.documento);

    if (this.esVistaGlobal) {
      this.puedeBuscar = true;
      this.syllabusService.setVerTodo(true);
      this.syllabusService.setProgramasVinculados([]);
      this.syllabusService.setrolwithEdit(true);
      this.cargando = false;
      return;
    }

    if (!datos) {
      this.cargando = false;
      Swal.fire({
        icon: 'error',
        title: 'No se pudo validar la identificación del usuario',
        text: 'No se encontraron los datos de identificación del usuario.',
      });
      return;
    }

    this.validarVinculacion(datos);
    this.cargarAsignaciones();
    this.cargarPendientes();
  }

  private validarVinculacion(datos: any): void {
    this.userService.postVinculacion(datos).subscribe({
      next: (res: any) => {
        const vinculado = !!(res && res.Success && Array.isArray(res.Data) && res.Data.length > 0);
        this.esCoordinador = vinculado;
        if (vinculado) {
          this.syllabusService.setProgramasVinculados(res.Data);
        } else {
          this.syllabusService.setProgramasVinculados([]);
        }
        this.actualizarPuedeBuscar();
      },
      error: () => {
        this.esCoordinador = false;
        this.syllabusService.setProgramasVinculados([]);
        this.actualizarPuedeBuscar();
      },
    });
  }

  private cargarAsignaciones(): void {
    this.flujoService.misAsignaciones(this.documento).subscribe({
      next: (res: any) => {
        const data = res && res.Success ? res.Data : [];
        this.asignaciones = Array.isArray(data) ? data : [];
        this.esDocente = this.asignaciones.length > 0;
        this.flujoService.setAsignaciones(this.asignaciones);
        this.actualizarPuedeBuscar();
      },
      error: () => {
        this.esDocente = false;
        this.actualizarPuedeBuscar();
      },
    });
  }

  private cargarPendientes(): void {
    this.flujoService.pendientes(this.documento).subscribe({
      next: (res: any) => {
        const data = res && res.Success ? res.Data : [];
        this.pendientes = Array.isArray(data) ? data : [];
        this.flujoService.setPendientes(this.pendientes);
        this.cargando = false;
      },
      error: () => {
        this.pendientes = [];
        this.cargando = false;
      },
    });
  }

  private actualizarPuedeBuscar(): void {
    this.puedeBuscar = this.esCoordinador || this.esDocente || this.esVistaGlobal;
    this.syllabusService.setrolwithEdit(this.esCoordinador || this.esVistaGlobal);
    this.cargando = false;
  }

  irAlBuscador(): void {
    this.router.navigate(['/buscar_syllabus'], { skipLocationChange: true });
  }

  editarAsignacion(draft: any): void {
    const proyectoId = draft.proyecto_curricular_ids?.[0];
    const planId = draft.plan_estudios_ids?.[0];
    this.syllabusService.setProyectoAcademico({ Id: proyectoId, Nombre: '' } as any);
    this.syllabusService.setPlanEstudios({
      pen_nro: planId,
      pen_cra_cod: proyectoId,
      cra_nombre: '',
    } as any);
    this.syllabusService.setEspacioAcademico({
      asi_cod: draft.espacio_academico_id,
      asi_nombre: '',
    } as any);
    this.syllabusService.setisNew(false);
    this.syllabusService.setSyllabus(draft);
    this.syllabusService.setFlujoDraft({ code: draft.syllabus_code, estado: draft.estado });
    this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
  }

  abrirAprobacion(draft: any): void {
    const dialogRef = this.dialog.open(AprobacionComponent, {
      width: '640px',
      maxWidth: '94vw',
      data: { draft, documento: this.documento },
    });
    dialogRef.afterClosed().subscribe((actualizado) => {
      if (actualizado) {
        this.cargarPendientes();
        this.cargarAsignaciones();
      }
    });
  }

  estadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      asignado: 'Asignado (edición)',
      en_revision: 'En revisión',
      rechazado: 'Rechazado',
      expirado: 'Expirado',
      cancelado: 'Cancelado',
      activo: 'Activo',
    };
    return labels[estado] || estado;
  }

  fechaCorta(fecha: string | undefined): string {
    return fecha ? fecha.split('T')[0] : 'Sin definir';
  }

  esEditable(draft: any): boolean {
    return draft.estado === 'asignado' || draft.estado === 'rechazado';
  }

  verMotivo(draft: any): void {
    Swal.fire({
      icon: 'info',
      title: 'Detalle de la propuesta',
      html: `
        <p><strong>Estado:</strong> ${this.estadoLabel(draft.estado)}</p>
        <p><strong>Motivo de rechazo:</strong> ${draft.flujo?.motivo_rechazo || 'No aplica'}</p>
        <p><strong>Docente asignado:</strong> ${draft.flujo?.asignado_a_documento || 'N/D'}</p>
      `,
    });
  }
}
