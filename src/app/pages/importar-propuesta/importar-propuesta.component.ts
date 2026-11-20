import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { Syllabus } from 'src/app/@core/models/syllabus';
import { RequestManager } from '../services/requestManager';

export interface ImportarPropuestaData {
  codigoProyecto: string | number;
}

@Component({
  selector: 'app-importar-propuesta',
  templateUrl: './importar-propuesta.component.html',
  styleUrls: ['./importar-propuesta.component.scss'],
})
export class ImportarPropuestaComponent implements OnInit {
  propuestas: Syllabus[] = [];
  cargando = true;
  error = false;

  constructor(
    private request: RequestManager,
    public dialogRef: MatDialogRef<ImportarPropuestaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportarPropuestaData
  ) {}

  ngOnInit(): void {
    const query = encodeURIComponent(
      `proyecto_curricular_id:${this.data.codigoProyecto},es_propuesta:true`
    );

    // Esta consulta se hace únicamente después de que el usuario pulsa
    // "Importar desde una propuesta" en el editor.
    this.request
      .get(environment.SYLLABUS_CRUD, `syllabus?query=${query}&limit=50`)
      .subscribe({
        next: (respuesta: any) => {
          this.propuestas = Array.isArray(respuesta?.Data) ? respuesta.Data : [];
          this.cargando = false;
        },
        error: () => {
          this.error = true;
          this.cargando = false;
        },
      });
  }

  seleccionar(propuesta: Syllabus): void {
    this.dialogRef.close(propuesta);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
