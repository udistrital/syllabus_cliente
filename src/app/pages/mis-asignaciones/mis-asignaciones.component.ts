import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../services/userService';
import { SyllabusService } from '../services/syllabus.service';
import { FlujoService } from '../services/flujo.service';
import { VisualizarSyllabusComponent } from '../visualizar-syllabus/visualizar-syllabus.component';
import { estadoLabel, fechaCorta, esEditable } from 'src/app/@core/utils/flujo.helpers';

@Component({
  selector: 'app-mis-asignaciones',
  templateUrl: './mis-asignaciones.component.html',
  styleUrls: ['./mis-asignaciones.component.scss'],
})
export class MisAsignacionesComponent implements OnInit {
  cargando = true;
  documento = '';
  asignaciones: any[] = [];
  columnas: string[] = ['espacio', 'estado', 'fecha_limite', 'motivo', 'acciones'];

  readonly estadoLabel = estadoLabel;
  readonly fechaCorta = fechaCorta;
  readonly esEditable = esEditable;

  constructor(
    private router: Router,
    private userService: UserService,
    private syllabusService: SyllabusService,
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
    this.flujoService.misAsignaciones(this.documento).subscribe({
      next: (res: any) => {
        const data = res && res.Success ? res.Data : [];
        this.asignaciones = Array.isArray(data) ? data : [];
        this.flujoService.setAsignaciones(this.asignaciones);
        this.cargando = false;
      },
      error: () => {
        this.asignaciones = [];
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar sus asignaciones.',
        });
      },
    });
  }

  editarAsignacion(draft: any): void {
    this.syllabusService.setContextoDesdeBorrador(draft);
    this.syllabusService.setisNew(false);
    this.syllabusService.setSyllabus(draft);
    this.syllabusService.setFlujoDraft({ code: draft.syllabus_code, estado: draft.estado });
    this.router.navigate(['/crear_syllabus'], { skipLocationChange: true });
  }

  verPdf(draft: any): void {
    this.syllabusService.setContextoDesdeBorrador(draft);
    this.syllabusService.setSyllabus(draft);
    const dialogRef = this.dialog.open(VisualizarSyllabusComponent, {
      width: '80vw',
      height: '90vh',
      maxWidth: '96vw',
      maxHeight: '94vh',
      panelClass: 'sga-modal-panel',
    });
    dialogRef.componentInstance.Syllabus = draft;
  }

  verMotivo(draft: any): void {
    Swal.fire({
      icon: 'info',
      title: 'Detalle de la propuesta',
      html: `
        <p><strong>Estado:</strong> ${estadoLabel(draft.estado)}</p>
        <p><strong>Motivo de rechazo:</strong> ${draft.flujo?.motivo_rechazo || 'No aplica'}</p>
        <p><strong>Docente asignado:</strong> ${draft.flujo?.asignado_a_documento || 'N/D'}</p>
      `,
    });
  }

  regresar(): void {
    this.router.navigate(['/dashboard'], { skipLocationChange: true });
  }
}
