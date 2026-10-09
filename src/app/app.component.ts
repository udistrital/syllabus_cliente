import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserService } from './pages/services/userService';
import { LocalStorageService } from './@core/utils/local_storage.service';
import { WindowRefService } from './@core/utils/windowref.service';
import { RequestManager } from './pages/services/requestManager';
import { getCookie } from 'src/utils/cookie';

declare let gtag: Function;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'syllabus_cliente';
  environment = environment;
  loadRouting = false;
  loaded: boolean = false;
  isMicrofrontend = (window as any).__MICROFRONTEND__ === true;
  whatLang$ = fromEvent(window, 'lang');

  @ViewChild('oasElement') oasElement?: ElementRef<HTMLElement>;

  private readonly onOasUser = (event: any) => {
    if (event.detail) {
      this.onAuthenticated();
    }
  };

  private readonly onOasOption = (event: any) => {
    if (event.detail) {
      setTimeout(() => this.router.navigate([event.detail.Url], { skipLocationChange: true }), 50);
    }
  };

  private readonly onOasLogout = (event: any) => {
    if (event.detail) {
    }
  };

  constructor(
    private router: Router,
    private userService: UserService,
    private localStore: LocalStorageService,
    private translate: TranslateService,
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
    this.validateLang();

    // El layout OAS y su respaldo de menú solo aplican en modo standalone.
    if (this.isMicrofrontend) {
      return;
    }
  }

  ngAfterViewInit(): void {
    if (this.isMicrofrontend) {
      return;
    }

    const oas = this.oasElement?.nativeElement;
    if (!oas) {
      return;
    }

    oas.addEventListener('user', this.onOasUser);
    oas.addEventListener('option', this.onOasOption);
    oas.addEventListener('logout', this.onOasLogout);

    // El evento `user` del OAS es one-shot (take(1)): si ya hay sesión,
    // no esperamos al evento para revelar el layout y navegar al dashboard.
    if (this.hasSession()) {
      this.onAuthenticated();
    }
  }

  ngOnDestroy(): void {
    const oas = this.oasElement?.nativeElement;
    if (!oas) {
      return;
    }

    oas.removeEventListener('user', this.onOasUser);
    oas.removeEventListener('option', this.onOasOption);
    oas.removeEventListener('logout', this.onOasLogout);
  }

  private hasSession(): boolean {
    return !!localStorage.getItem('id_token');
  }

  private onAuthenticated(): void {
    this.loaded = true;
    this.userService.updateAuth();
    this.router.navigate(['/dashboard'], { skipLocationChange: true });
  }

  validateLang() {
    let lang = getCookie('lang') || 'es';
    this.whatLang$.subscribe((x: any) => {
      lang = x['detail']['answer'];
      this.translate.use(lang);
    });
    this.translate.use(lang);
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
