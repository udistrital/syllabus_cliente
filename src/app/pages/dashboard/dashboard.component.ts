import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor( private router: Router){
    
  }

  goToSearch(){
    this.router.navigate(['/buscar_syllabus'])
  }

}
