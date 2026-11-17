import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, throwError } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import * as moment from 'moment';
import { FlujoService } from '../services/flujo.service';
import { SyllabusService } from '../services/syllabus.service';
import { GestorDocumentalService } from '../services/gestor_documental.service';
import { VisualizarSyllabusComponent } from '../visualizar-syllabus/visualizar-syllabus.component';

export interface AprobacionData {
  draft: any;
  documento: string;
}

const ID_DOCUMENTO_ACTA = 74;

@Component({
  selector: 'app-aprobacion',
  templateUrl: './aprobacion.component.html',
  styleUrls: ['./aprobacion.component.scss'],
})
export class AprobacionComponent implements OnInit {
  form: FormGroup;
  procesando = false;
  actaFile: File | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private flujoService: FlujoService,
    private syllabusService: SyllabusService,
    private gestorService: GestorDocumentalService,
    public dialogRef: MatDialogRef<AprobacionComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: AprobacionData
  ) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      motivo_rechazo: [''],
      fecha_limite: [''],
      numeroActa: ['', [Validators.required]],
      archivo: ['', [Validators.required]],
    });
  }

  get draft(): any {
    return this.data.draft;
  }

  get puedeReabrir(): boolean {
    return this.draft.estado === 'rechazado' || this.draft.estado === 'expirado';
  }

  verPdf(): void {
    this.syllabusService.setContextoDesdeBorrador(this.draft);
    this.syllabusService.setSyllabus(this.draft);
    const dialogRef = this.dialog.open(VisualizarSyllabusComponent, {
      width: '80vw',
      height: '90vh',
      maxWidth: '96vw',
      maxHeight: '94vh',
      panelClass: 'sga-modal-panel',
    });
    dialogRef.componentInstance.Syllabus = this.draft;
  }

  private fechaFormateada(): string | undefined {
    const fecha = this.form.get('fecha_limite')?.value;
    return fecha ? moment(fecha).format('YYYY-MM-DD') : undefined;
  }

  handleFileInputActaChange(event: any): void {
    this.actaFile = event.target.files[0] ?? null;
    if (this.actaFile && this.actaFile.type !== 'application/pdf') {
      this.actaFile = null;
      this.form.get('archivo')?.setValue('');
      this.form.get('archivo')?.setErrors({ incorrect: true });
      return;
    }
    this.form.get('archivo')?.setValue(this.actaFile ? this.actaFile.name : '');
  }

  private subirActa(): Observable<string> {
    const archivo = this.actaFile;
    if (!archivo) {
      return throwError(() => new Error('No hay archivo de acta para cargar'));
    }
    return new Observable<string>((observer) => {
      const sendActa = {
        IdDocumento: ID_DOCUMENTO_ACTA,
        nombre: archivo.name.split('.')[0],
        metadatos: {
          proyecto: this.draft.proyecto_curricular_ids?.[0] ?? '',
          plan_estudio: this.draft.plan_estudios_ids?.[0] ?? '',
          espacio_academico: this.draft.espacio_academico_id ?? '',
        },
        descripcion: 'Acta de consejo curricular para syllabus',
        file: archivo,
      };
      this.gestorService.uploadFiles(sendActa).subscribe({
        next: (res: any) => {
          const enlace = res?.res?.Enlace;
          if (!enlace) {
            observer.error(new Error('No se obtuvo el identificador del acta'));
            return;
          }
          observer.next(enlace);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  aprobar(): void {
    if (this.form.get('numeroActa')?.invalid || this.form.get('archivo')?.invalid || this.form.get('archivo')?.hasError('incorrect')) {
      this.form.markAllAsTouched();
      Swal.fire({ icon: 'warning', title: 'Complete el número y el archivo del acta' });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '¿Aprobar la propuesta?',
      text: 'La propuesta se convertirá en la versión activa y se despublicará la anterior.',
      showCancelButton: true,
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (!result.isConfirmed) {
        return;
      }
      this.procesando = true;
      Swal.showLoading();
      this.subirActa().subscribe({
        next: (archivo) => {
          this.flujoService
            .aprobar(this.draft.syllabus_code, {
              documento: this.data.documento,
              numeroActa: this.form.get('numeroActa')?.value,
              archivo,
            })
            .subscribe({
              next: (res: any) => this.finalizar(res, 'Propuesta aprobada y publicada'),
              error: (err) => this.error(err),
            });
        },
        error: () => this.error(new Error('No se pudo cargar el acta')),
      });
    });
  }

  rechazar(): void {
    const motivo = this.form.get('motivo_rechazo')?.value;
    if (!motivo) {
      Swal.fire({ icon: 'warning', title: 'Ingrese el motivo del rechazo' });
      return;
    }
    this.procesando = true;
    this.flujoService
      .rechazar(this.draft.syllabus_code, {
        documento: this.data.documento,
        motivo_rechazo: motivo,
        fecha_limite: this.fechaFormateada(),
      })
      .subscribe({
        next: (res: any) => this.finalizar(res, 'Propuesta rechazada'),
        error: (err) => this.error(err),
      });
  }

  reabrir(): void {
    const fecha = this.fechaFormateada();
    if (!fecha) {
      Swal.fire({ icon: 'warning', title: 'Indique la nueva fecha límite' });
      return;
    }
    this.procesando = true;
    this.flujoService
      .reabrir(this.draft.syllabus_code, {
        documento: this.data.documento,
        fecha_limite: fecha,
      })
      .subscribe({
        next: (res: any) => this.finalizar(res, 'Propuesta reabierta'),
        error: (err) => this.error(err),
      });
  }

  private finalizar(res: any, titulo: string): void {
    this.procesando = false;
    if (res && res.Success) {
      Swal.fire({ icon: 'success', title: titulo });
      this.dialogRef.close(true);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo completar la acción',
        text: (res && res.Message) || 'Intente nuevamente.',
      });
    }
  }

  private error(err: any): void {
    this.procesando = false;
    Swal.fire({
      icon: 'error',
      title: 'No se pudo completar la acción',
      text: err?.error?.Message || err?.message || 'Intente nuevamente.',
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
