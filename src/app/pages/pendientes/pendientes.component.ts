import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../services/userService';
import { FlujoService } from '../services/flujo.service';
import { AprobacionComponent } from '../aprobacion/aprobacion.component';
import { estadoLabel, fechaCorta } from 'src/app/@core/utils/flujo.helpers';

@Component({
  selector: 'app-pendientes',
  templateUrl: './pendientes.component.html',
  styleUrls: ['./pendientes.component.scss'],
})
export class PendientesComponent implements OnInit {
  cargando = true;
  documento = '';
  pendientes: any[] = [];
  columnas: string[] = ['espacio', 'docente', 'estado', 'fecha_limite', 'acciones'];

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
        const data = res && res.Success ? res.Data : [];
        this.pendientes = Array.isArray(data) ? data : [];
        this.flujoService.setPendientes(this.pendientes);
        this.cargando = false;
      },
      error: () => {
        this.pendientes = [];
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las propuestas pendientes.',
        });
      },
    });
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

  regresar(): void {
    this.router.navigate(['/dashboard'], { skipLocationChange: true });
  }
}
