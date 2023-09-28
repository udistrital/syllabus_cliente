import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/userService';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  isValidRol:boolean=false;
  ValidRols:string[]=['ASESOR_VICE','VICERRECTOR','JEFE_DEPENDENCIA','COORDINADOR'];
  constructor( private router: Router,private userService:UserService){
    userService.user$.subscribe({
      next:(data:any) => {
        const {user}=data;
        //consol.log(typeof user,user);
        if(typeof user!==undefined){
          this.ValidRols.forEach((rol)=>{
            if(user.role.includes(rol)){
              this.isValidRol=true;
            }
          })
        }
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
