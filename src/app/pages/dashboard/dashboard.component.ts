import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { UserService } from '../services/userService';
import { SyllabusService } from '../services/syllabus.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isValidRol:boolean=false;
  isAsesorVicerrector:boolean=false;
  puedeBuscar:boolean=false;
  ValidRols:string[]=['ASESOR_VICE','VICERRECTOR','JEFE_DEPENDENCIA','COORDINADOR','DECANO','DOCENTE'];
  constructor( private router: Router,private userService:UserService,private syllabusService:SyllabusService){
    userService.user$.subscribe({
      next:(data:any) => {
        const {user}=data;
        if(typeof user!==undefined){
          this.ValidRols.forEach((rol)=>{
            if(user.role.includes(rol)){
              this.isValidRol=true;
            }
          });
          if(user.role.includes('ASESOR_VICE') || user.role.includes('VICERRECTOR')){
            this.isAsesorVicerrector = true;
            // syllabusService.setrolwithEdit(true);
          };
        };
      },
      error:(error) => {
        //consol.log('error',error)
      }
    })
  }

  ngOnInit(): void {
    const role = this.userService.getPayload()?.role || [];
    if (role.includes('ASESOR_VICE') || role.includes('VICERRECTOR')) {
      this.setPuedeBuscar(true);
      this.syllabusService.setVerTodo(true);
      this.syllabusService.setProgramasVinculados([]);
      return;
    }

    this.userService.terceroListo$
      .pipe(filter((listo: boolean) => listo), take(1))
      .subscribe(() => {
        const payload = this.userService.getDatosVinculacion();
        if (!payload) {
          this.setPuedeBuscar(false);
          Swal.fire({
            icon: 'error',
            title: 'No se pudo validar la vinculación',
            text: 'No se encontraron los datos de identificación del usuario.'
          });
          return;
        }

        this.userService.postVinculacion(payload).subscribe({
          next: (res: any) => {
            const vinculado = !!(res && res.Success && Array.isArray(res.Data) && res.Data.length > 0);
            this.setPuedeBuscar(vinculado);
            if (vinculado) {
              this.syllabusService.setProgramasVinculados(res.Data);
            } else {
              this.syllabusService.setProgramasVinculados([]);
              Swal.fire({
                icon: 'error',
                title: 'Vinculación no válida',
                text: (res && res.Message) ? res.Message : 'No se encontraron programas vinculados para su usuario.'
              });
            }
          },
          error: () => {
            this.setPuedeBuscar(false);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo validar la vinculación. Intente nuevamente.'
            });
          }
        });
      });
  }

  goToSearch(){
    this.navigateToSearch();
  }

  private setPuedeBuscar(valor: boolean){
    this.puedeBuscar = valor;
    this.syllabusService.setrolwithEdit(valor);
  }

  private navigateToSearch(){
    this.router.navigate(['/buscar_syllabus'], { skipLocationChange: true })
  }

}
