import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import * as moment from 'moment';
import { FlujoService } from '../services/flujo.service';
import { AsignarRequest } from 'src/app/@core/models/flujo';

export interface AsignarDocenteData {
  documento?: string;
  syllabus_code?: string;
  espacio_academico_id?: number;
  proyecto_curricular_ids?: number[];
  plan_estudios_ids?: number[];
}

@Component({
  selector: 'app-asignar-docente',
  templateUrl: './asignar-docente.component.html',
  styleUrls: ['./asignar-docente.component.scss'],
})
export class AsignarDocenteComponent implements OnInit {
  form: FormGroup;
  docenteNombre = '';
  buscando = false;
  asignando = false;
  maxDate: Date = moment().add(1, 'years').toDate();

  constructor(
    private _formBuilder: FormBuilder,
    private flujoService: FlujoService,
    public dialogRef: MatDialogRef<AsignarDocenteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AsignarDocenteData
  ) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      documento_docente: ['', [Validators.required]],
      fecha_limite: ['', [Validators.required]],
      observacion: [''],
    });
  }

  get esSyllabusExistente(): boolean {
    return !!this.data.syllabus_code;
  }

  buscarDocente(): void {
    const documento = this.form.get('documento_docente')?.value;
    if (!documento) {
      Swal.fire({ icon: 'warning', title: 'Ingrese el documento del docente' });
      return;
    }
    this.buscando = true;
    this.flujoService.buscarDocente(documento).subscribe({
      next: (res: any) => {
        this.buscando = false;
        if (res && res.Success && res.Data) {
          this.docenteNombre = res.Data.NombreCompleto || 'Docente encontrado';
        } else {
          this.docenteNombre = '';
          Swal.fire({
            icon: 'warning',
            title: 'Docente no encontrado',
            text: (res && res.Message) || 'No se encontró un tercero con ese documento.',
          });
        }
      },
      error: (err) => {
        this.buscando = false;
        this.docenteNombre = '';
        Swal.fire({
          icon: 'error',
          title: 'Error consultando el docente',
          text: this.mensajeError(err),
        });
      },
    });
  }

  asignar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const fecha = this.form.get('fecha_limite')?.value;
    const payload: AsignarRequest = {
      documento: this.data.documento,
      documento_docente: this.form.get('documento_docente')?.value,
      fecha_limite: moment(fecha).format('YYYY-MM-DD'),
      observacion: this.form.get('observacion')?.value,
    };

    if (this.data.syllabus_code) {
      payload.syllabus_code = this.data.syllabus_code;
    } else {
      payload.espacio_academico_id = this.data.espacio_academico_id;
      payload.proyecto_curricular_ids = this.data.proyecto_curricular_ids;
      payload.plan_estudios_ids = this.data.plan_estudios_ids;
    }

    this.asignando = true;
    this.flujoService.asignar(payload).subscribe({
      next: (res: any) => {
        this.asignando = false;
        if (res && res.Success) {
          Swal.fire({ icon: 'success', title: 'Syllabus asignado al docente' });
          this.dialogRef.close(true);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo asignar',
            text: (res && res.Message) || 'Intente nuevamente.',
          });
        }
      },
      error: (err) => {
        this.asignando = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo asignar',
          text: this.mensajeError(err),
        });
      },
    });
  }

  private mensajeError(err: any): string {
    return err?.error?.Message || err?.message || 'Intente nuevamente.';
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
