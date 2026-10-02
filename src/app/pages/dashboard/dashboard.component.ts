import { Component } from '@angular/core';
import { Router } from '@angular/router';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { UserService } from '../services/userService';
import { SyllabusService } from '../services/syllabus.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  isValidRol:boolean=false;
  isAsesorVicerrector:boolean=false;
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
            syllabusService.setrolwithEdit(true);
          };
        };
      },
      error:(error) => {
        //consol.log('error',error)
      }
    })
  }

  goToSearch(){
    if (this.isAsesorVicerrector) {
      this.navigateToSearch();
      return;
    }

    const payload = this.userService.getDatosVinculacion();
    if (!payload) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo validar la vinculación',
        text: 'No se encontraron los datos de identificación del usuario.'
      });
      return;
    }

    this.userService.postVinculacion(payload).subscribe({
      next: (res: any) => {
        if (res && res.Success) {
          this.navigateToSearch();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Vinculación no válida',
            text: (res && res.Message) ? res.Message : 'No se pudo validar la vinculación.'
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo validar la vinculación. Intente nuevamente.'
        });
      }
    });
  }

  private navigateToSearch(){
    this.router.navigate(['/buscar_syllabus'], { skipLocationChange: true })
  }

}
