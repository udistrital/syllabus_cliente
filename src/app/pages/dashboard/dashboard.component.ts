import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/userService';
import { SyllabusService } from '../services/syllabus.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  isValidRol:boolean=false;
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
    this.router.navigate(['/buscar_syllabus'], { skipLocationChange: true })
  }

}
