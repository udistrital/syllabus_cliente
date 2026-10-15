import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../services/userService';
import { FlujoService } from '../services/flujo.service';
import { AprobacionComponent } from '../aprobacion/aprobacion.component';
import { AsignarDocenteComponent } from '../asignar-docente/asignar-docente.component';
import { estadoLabel, fechaCorta } from 'src/app/@core/utils/flujo.helpers';

@Component({
  selector: 'app-pendientes',
  templateUrl: './pendientes.component.html',
  styleUrls: ['./pendientes.component.scss'],
})
export class PendientesComponent implements OnInit {
  cargando = true;
  tab = 0;
  documento = '';
  enRevision: any[] = [];
  enCurso: any[] = [];
  columnasRevision: string[] = ['espacio', 'docente', 'estado', 'fecha_limite', 'acciones'];
  columnasCurso: string[] = ['espacio', 'docente', 'estado', 'fecha_limite', 'motivo', 'acciones'];

  readonly estadoLabel = estadoLabel;
  readonly fechaCorta = fechaCorta;

  constructor(
    private router: Router,
    private userService: UserService,
    private flujoService: FlujoService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userService.terceroListo$
      .pipe(filter((listo: boolean) => listo), take(1))
      .subscribe(() => {
        this.documento = this.resolverDocumento();
        this.flujoService.setDocumento(this.documento);
        this.cargar();
      });
  }

  private resolverDocumento(): string {
    const datos = this.userService.getDatosVinculacion();
    return this.userService.getPayload()?.documento || (datos ? datos.Identificacion : '') || '';
  }

  cargar(): void {
    this.cargando = true;
    this.flujoService.pendientes(this.documento).subscribe({
      next: (res: any) => {
        const data = res && res.Success && Array.isArray(res.Data) ? res.Data : [];
        this.enRevision = data.filter((d: any) => d.estado === 'en_revision');
        this.enCurso = data.filter((d: any) => ['asignado', 'rechazado', 'expirado'].includes(d.estado));
        this.flujoService.setPendientes(data);
        this.cargando = false;
      },
      error: () => {
        this.enRevision = [];
        this.enCurso = [];
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las propuestas del programa.',
        });
      },
    });
  }

  puedeReabrir(draft: any): boolean {
    return draft.estado === 'rechazado' || draft.estado === 'expirado';
  }

  abrirAprobacion(draft: any): void {
    const dialogRef = this.dialog.open(AprobacionComponent, {
      width: '640px',
      maxWidth: '94vw',
      data: { draft, documento: this.documento },
    });
    dialogRef.afterClosed().subscribe((actualizado) => {
      if (actualizado) {
        this.cargar();
      }
    });
  }

  reasignar(draft: any): void {
    const dialogRef = this.dialog.open(AsignarDocenteComponent, {
      width: '560px',
      maxWidth: '94vw',
      panelClass: 'sga-modal-panel',
      data: { mode: 'reasignar', code: draft.syllabus_code, documento: this.documento },
    });
    dialogRef.afterClosed().subscribe((cambiado) => {
      if (cambiado) {
        this.cargar();
      }
    });
  }

  reabrir(draft: any): void {
    Swal.fire({
      title: 'Reabrir propuesta',
      html: 'Indique la nueva fecha límite de edición para el docente.',
      input: 'date',
      inputLabel: 'Nueva fecha límite',
      confirmButtonText: 'Reabrir',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: (fecha: any) => {
        if (!fecha) {
          Swal.showValidationMessage('La nueva fecha límite es obligatoria');
          return false;
        }
        return fecha;
      },
    }).then((result: any) => {
      if (!result.isConfirmed) {
        return;
      }
      this.flujoService
        .reabrir(draft.syllabus_code, { documento: this.documento, fecha_limite: result.value })
        .subscribe({
          next: (res: any) => this.manejarRespuesta(res, 'Propuesta reabierta'),
          error: (err) => this.errorGenerico(err),
        });
    });
  }

  cancelarPropuesta(draft: any): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Cancelar la propuesta?',
      html: 'La propuesta quedará descartada y el docente perderá acceso a ella.',
      input: 'text',
      inputLabel: 'Motivo de cancelación (opcional)',
      inputPlaceholder: 'Motivo',
      confirmButtonText: 'Cancelar propuesta',
      showCancelButton: true,
      cancelButtonText: 'Volver',
    }).then((result: any) => {
      if (!result.isConfirmed) {
        return;
      }
      this.flujoService
        .cancelar(draft.syllabus_code, { documento: this.documento, observacion: result.value || '' })
        .subscribe({
          next: (res: any) => this.manejarRespuesta(res, 'Propuesta cancelada'),
          error: (err) => this.errorGenerico(err),
        });
    });
  }

  private manejarRespuesta(res: any, titulo: string): void {
    if (res && res.Success) {
      Swal.fire({ icon: 'success', title: titulo });
      this.cargar();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo completar la acción',
        text: (res && res.Message) || 'Intente nuevamente.',
      });
    }
  }

  private errorGenerico(err: any): void {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo completar la acción',
      text: err?.error?.Message || err?.message || 'Intente nuevamente.',
    });
  }

  regresar(): void {
    this.router.navigate(['/dashboard'], { skipLocationChange: true });
  }
}
