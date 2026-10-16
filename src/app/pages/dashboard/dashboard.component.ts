import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { UserService } from '../services/userService';
import { SyllabusService } from '../services/syllabus.service';
import { FlujoService } from '../services/flujo.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  puedeBuscar = false;
  esCoordinador = false;
  esVistaGlobal = false;
  cargando = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private syllabusService: SyllabusService,
    private flujoService: FlujoService
  ) {}

  ngOnInit(): void {
    this.esVistaGlobal = this.userService.esVistaGlobal();

    this.userService.terceroListo$
      .pipe(filter((listo: boolean) => listo), take(1))
      .subscribe(() => this.inicializar());
  }

  private inicializar(): void {
    const datos = this.userService.getDatosVinculacion();
    const documento =
      this.userService.getPayload()?.documento ||
      (datos ? datos.Identificacion : '') ||
      '';
    this.flujoService.setDocumento(documento);

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
  }

  private validarVinculacion(datos: any): void {
    this.userService.postVinculacion(datos).subscribe({
      next: (res: any) => {
        const vinculado = !!(res && res.Success && Array.isArray(res.Data) && res.Data.length > 0);
        this.esCoordinador = vinculado;
        this.syllabusService.setProgramasVinculados(vinculado ? res.Data : []);
        this.actualizarPuedeBuscar();
      },
      error: () => {
        this.esCoordinador = false;
        this.syllabusService.setProgramasVinculados([]);
        this.actualizarPuedeBuscar();
      },
    });
  }

  private actualizarPuedeBuscar(): void {
    this.puedeBuscar = this.esCoordinador || this.esVistaGlobal;
    this.syllabusService.setrolwithEdit(this.esCoordinador || this.esVistaGlobal);
    this.cargando = false;
  }

  // "Pendientes de aprobación": coordinadores y vista global (admin). El admin
  // ve la tarjeta pero con la acción deshabilitada.
  get mostrarPendientes(): boolean {
    return !this.cargando && (this.esCoordinador || this.esVistaGlobal);
  }

  // "Mis syllabus asignados": docentes y vista global (admin).
  get mostrarMisAsignados(): boolean {
    return !this.cargando && (!this.esCoordinador || this.esVistaGlobal);
  }

  // El administrador (vista global) no tiene asignaciones: no debe solicitar.
  get accionesDeshabilitadas(): boolean {
    return this.esVistaGlobal;
  }

  irAlBuscador(): void {
    this.router.navigate(['/buscar_syllabus'], { skipLocationChange: true });
  }

  irAMisAsignaciones(): void {
    this.router.navigate(['/mis-asignaciones'], { skipLocationChange: true });
  }

  irAPendientes(): void {
    this.router.navigate(['/pendientes'], { skipLocationChange: true });
  }
}
