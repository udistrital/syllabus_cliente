import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { environment } from 'src/environments/environment';
import { UserService } from './pages/services/userService';
import { LocalStorageService } from './@core/utils/local_storage.service';
import { WindowRefService } from './@core/utils/windowref.service';
import { RequestManager } from './pages/services/requestManager';

declare let gtag: Function;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'syllabus_cliente';
  environment = environment;
  loadRouting = false;
  loaded: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private localStore: LocalStorageService,
  ) {
    this.loaded=false;
    this.router.events.subscribe((event: any) => {
      // ? Machete?
      const urltk: string = event.url ? event.url : ""
      if (urltk.includes('/access_token')) {
        var params: any = {}, queryString = location.hash.substring(1), regex = /([^&=]+)=([^&]*)/g;
        let m;
        while (m = regex.exec(queryString)) {
          params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        const req = new XMLHttpRequest();
        const query = 'https://' + window.location.host + '?' + queryString;
        req.open('GET', query, true);
        if (!!params['id_token']) {
          const id_token_array = (params['id_token']).split('.');
          const payload = JSON.parse(atob(id_token_array[1]));
          localStore.saveData('access_token', params['access_token']);
          localStore.saveData('expires_in', params['expires_in']);
          localStore.saveData('state', params['state']);
          localStore.saveData('id_token', params['id_token']);
        }
      }
      // ? End of Machete?
      if (event instanceof NavigationEnd) {
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

    oas?.addEventListener('user', (event: any) => {
      if (event.detail) {
        this.loaded = true;
        this.userService.updateAuth();
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
      }
    });
  }


  // @HostListener('window:message', ['$event']) onPostMessage(e:any) {
  //   console.log("event window",e);
  //   if (e.data.type == 'authinfo') {
  //     this.loaded = true;
  //     this.loadRouting=true;
  //     const items=e.data.items;
  //     for(const [key,value] of Object.entries(items) ){
  //       this.localStore.saveData(key,value as string);
  //     }
  //   } else {
  //     const oas = document.querySelector('ng-uui-oas');

  //     oas?.addEventListener('user', (event: any) => {
  //       console.log("user",event)
  //       if (event.detail) {
  //         this.loaded = true;
  //         this.userService.updateUser(event.detail);
  //       }
  //     });

  //     oas?.addEventListener('option', (event: any) => {
  //       console.log("option",event)
  //       if (event.detail) {
  //         setTimeout(() => (this.router.navigate([event.detail.Url])), 50)
  //           ;
  //       }
  //     });

  //     oas?.addEventListener('logout', (event: any) => {
  //       console.log("option",event)
  //       if (event.detail) {
  //       }
  //     });
  //   }
  //}

}
