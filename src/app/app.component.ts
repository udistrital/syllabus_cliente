import { Component, OnInit} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { environment } from 'src/environments/environment';
import { UserService } from './pages/services/userService';

declare let gtag: Function;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  title = 'syllabus_cliente';
  environment = environment;
  loadRouting = false;
  loaded: boolean;
  column_start: number;
  constructor(
    private router: Router,
    private userService: UserService 
  ) {
    this.loaded=true;
    if(this.loaded){
      this.column_start=2;
      console.log(this.column_start);
    };
    this.column_start=1;
    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd){
        gtag('config', 'G-RBY2GQV40M', 
                {
                  'page_path': event.urlAfterRedirects
                }
               );
       }
    });
  }

  ngOnInit(): void {
    const oas = document.querySelector('ng-uui-oas');

    console.log(oas);

    oas?.addEventListener('user', (event: any) => {
      console.log(event)
      if (event.detail) {
        this.loadRouting = true;
        this.userService.updateUser(event.detail);
        console.log(this.loadRouting);
      }
    });

    oas?.addEventListener('option', (event: any) => {
      if (event.detail) {
        setTimeout(()=>(this.router.navigate([event.detail.Url])),50 )
        ;
      }
    });

    oas?.addEventListener('logout', (event: any) => {
      if (event.detail) {
        console.log(event.detail);
      }
    });

  }
  
 
}
