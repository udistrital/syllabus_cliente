import { Component, OnInit,HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { environment } from 'src/environments/environment';
import { UserService } from './pages/services/userService';
import { LocalStorageService } from './@core/utils/local_storage.service';
import { WindowRefService } from './@core/utils/windowref.service';

declare let gtag: Function;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'syllabus_cliente';
  environment = environment;
  loadRouting = false;
  loaded: boolean;

  constructor(
    private router: Router,
    private userService: UserService,
    private localStore: LocalStorageService,
    private windowref: WindowRefService
  ) {
    this.loaded=false;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-RBY2GQV40M',
          {
            'page_path': event.urlAfterRedirects
          }
        );
      }
    });
  }

  @HostListener('window:message', ['$event']) onPostMessage(e:any) {
    console.log('Message received',e);
    if (e.data.type == 'authinfo') {
      console.log("Message received from the parent: ", e.data); // Message received from parent
      this.loaded = true;
      this.loadRouting=true;
    } else {
      const oas = document.querySelector('ng-uui-oas');
      if(!this.loaded){
        this.loaded = false;
      }

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
          setTimeout(() => (this.router.navigate([event.detail.Url])), 50)
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

}
