import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { RequestManager } from '../services/requestManager';
import { LocalStorageService } from 'src/app/@core/utils/local_storage.service';
import { Md5 } from 'ts-md5';

const path = environment.TERCEROS;

@Injectable({
  providedIn: 'root',
})
export class UserService {

    
  environment = environment.TOKEN;
  logoutUrl: any;
  params: any;
  payload: any;
  timeActiveAlert: number = 4000;
  isLogin = false;
  private user: any;
  private timeLogoutBefore = 1000; // logout before in miliseconds
  private timeAlert = 300000; // alert in miliseconds 5 minutes

  private userSubject = new BehaviorSubject({});
  public tercero$ = this.userSubject.asObservable();
  //private user$ = new Subject<[object]>();
  public user$ = this.userSubject.asObservable();

  private menuSubject = new BehaviorSubject({});
  public menu$ = this.menuSubject.asObservable();

  private logoutSubject = new BehaviorSubject('');
  public logout$ = this.logoutSubject.asObservable();

  httpOptions: { headers: HttpHeaders; };

  constructor(private request: RequestManager, private localstorage: LocalStorageService) {

  }

  searchTercero() {
    this.request.updateHeaderToken();
    if (this.localstorage.getData('id_token') !== null && this.localstorage.getData('id_token') !== undefined) {
      /* const id_token = this.localstorage.getData('id_token').split('.');
      const payload = JSON.parse(atob(id_token[1])); */
      let DocIdentificacion: any = null;
      let CorreoUsuario = null;
      let UsuarioWSO2 = null;

      this.getDocument().then(async (document) => {
        //console.log('vida triste',document);
        if (document) {
          DocIdentificacion = document;
        }
        let payload =this.getPayload();
        UsuarioWSO2 = payload.sub ? payload.sub : null;
        CorreoUsuario = payload.email ? payload.email : null;

        let foundId: boolean = false;

        if (DocIdentificacion) {
          await this.findByDocument(DocIdentificacion, UsuarioWSO2, CorreoUsuario).then(found => foundId = true).catch(e => foundId = false);
        }
        //consol.log('found by doc',foundId);
        if (UsuarioWSO2 && !foundId) {
          await this.findByUserEmail(UsuarioWSO2).then(found => foundId = true).catch(e => foundId = false);
        }
        //consol.log('found by email',foundId);
        if (CorreoUsuario && !foundId) {
          await this.findByUserEmail(CorreoUsuario).then(found => foundId = true).catch(e => foundId = false);
        }
        //consol.log('found by email',foundId);
        if (!foundId) {
          this.localstorage.saveData('persona_id', '0');
        } else {
          if (payload.role.includes('JEFE_DEPENDENCIA') || payload.role.includes('COORDINADOR')) {
            this.request.get(environment.SGA_MID, 'admision/dependencia_vinculacion_tercero/' + this.user.Id).subscribe({
              next: (dataDependencias) => {
                //console.log(dataDependencias)
                this.localstorage.saveData('dependencias_persona_id', JSON.stringify(dataDependencias.Data.DependenciaId));
              },
              error: (error) => {
                //console.error(error);
                this.localstorage.saveData('dependencias_persona_id', JSON.stringify([]))
              }
            })
          }
        }

      });
    }
  }

  private findByDocument(DocIdentificacion: string, Usuario: string, Correo: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.request.get(path, 'datos_identificacion?query=Activo:true,Numero:' + DocIdentificacion + '&sortby=FechaCreacion&order=desc')
        .subscribe((res: any[]) => {
          if (res !== null) {
            if (res.length > 1) {
              let tercero = null;
              for (let i = 0; i < res.length; i++) {
                if (res[i].TerceroId.UsuarioWSO2 == Usuario) {
                  tercero = res[i].TerceroId;
                  break;
                }
              }
              if (tercero == null) {
                for (let i = 0; i < res.length; i++) {
                  if (res[i].TerceroId.UsuarioWSO2 == Correo) {
                    tercero = res[i].TerceroId;
                    break;
                  }
                }
              }
              if (tercero != null) {
                this.user = tercero;
              } else {
                this.user = res[0].TerceroId;
              }
            } else {
              this.user = res[0].TerceroId;
            }

            this.user['Documento'] = DocIdentificacion;
            if (Object.keys(this.user).length !== 0) {
              //this.user$.next(this.user);
              //console.log("finddoc",this.user)
              //this.userSubject.next(this.user);              // this.localstorage.saveData('ente', res[0].Ente);
              this.localstorage.saveData('persona_id', this.user.Id);
              resolve(true);
            } else {
              //this.user$.next(this.user);
              this.localstorage.saveData('persona_id', '0');
              reject(false);
            }
          } else {
            reject(false);
          }
        });
    });
  }

  private findByUserEmail(UserEmail: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.request.get(path, 'tercero?query=UsuarioWSO2:' + UserEmail)
        .subscribe(res => {
          if (res !== null) {
            this.user = res[0];
            if (Object.keys(this.user).length !== 0) {
              //this.user$.next(this.user);
              //consol.log("findemail",this.user)
              //this.userSubject.next(this.user);
              this.localstorage.saveData('persona_id', this.user.Id);
              resolve(true);
            } else {
              //this.user$.next(this.user);
              this.localstorage.saveData('persona_id', '0');
              reject(false);
            }
          }
          else {
            //this.user$.next(this.user);
            this.localstorage.saveData('persona_id', '0');
            reject(false);
          }
        });
    });
  }

  // public getEnte(): number {
  //   return parseInt(localstorage.getData('ente'), 10);
  // }

  public getPrograma(): number {
    return parseInt(this.localstorage.getData('programa')!, 10);
  }

  public getUsuario(): string {
    return this.localstorage.getData('user')!.toString();
  }

  public getPersonaId(): number {
    return parseInt(this.localstorage.getData('persona_id')!, 10);
  }

  public getPeriodo(): number {
    return parseInt(this.localstorage.getData('IdPeriodo')!, 10)
  }

  public getUser() {
    return this.userSubject.asObservable();
  }

  updateAuth(payload?: any) {
    const user = this.localstorage.getData('user');
    if (user) {
      this.userSubject.next(JSON.parse(atob(user)));
    } else {
      // this.httpOptions = {
      //   headers: new HttpHeaders({
      //     'Accept': 'application/json',
      //     'Authorization': `Bearer ${this.localstorage.getData('access_token')}`,
      //   }),
      // };
      // const userTemp = payload.email;
      // this.user = { user: userTemp };
      // this.httpClient.post<any>(this.environment.AUTENTICACION_MID, {
      //   user: (payload.email)
      // }, this.httpOptions)
      //   .pipe(retry(3))
      //   .subscribe((res: any) => {
      //     this.clearUrl();
      //     localstorage.setItem('user', btoa(JSON.stringify({ ...{ user: payload }, ...{ userService: res } })));
      //     // this.userSubject.next({ ...{ user: payload }, ...{ userService: res } });
      //   }, (error) => (//console.log(error))
      //   );
      // this.httpOptions = {
      //   headers: new HttpHeaders({
      //     'Accept': 'application/json',
      //     'Authorization': `Bearer ${this.localstorage.getData('access_token')}`,
      //   }),
      // };
    }
    this.searchTercero();
  }

  public logout(action: any): void {
    const state = this.localstorage.getData('state');
    const idToken = this.localstorage.getData('id_token');
    if (!!state && !!idToken) {
      this.logoutUrl = this.environment.SIGN_OUT_URL;
      this.logoutUrl += '?id_token_hint=' + idToken;
      this.logoutUrl += '&post_logout_redirect_uri=' + this.environment.SIGN_OUT_REDIRECT_URL;
      this.logoutUrl += '&state=' + state;
      this.clearStorage();
      this.logoutSubject.next(action);
      window.location.replace(this.logoutUrl);
    }
  }

  public getPayload(): any {
    const idToken = this.localstorage.getData('id_token')?.split('.');
    if (idToken) {
      const payload = JSON.parse(atob(idToken[1]));
      return payload;
    }
  }

  public getRole() {
    const rolePromise = new Promise<string[]>((resolve, reject) => {
      this.userSubject.subscribe({
        next:(data: any) => {
          console.log(data)
          const { user, userService } = data;
          const roleUser = typeof user !== 'undefined' ? user.role : [];
          const roleUserService = typeof userService !== 'undefined' ? userService.role : [];
          const roles = (roleUser.concat(roleUserService)).filter((data: any) => (data.indexOf('/') === -1));
          resolve(roles);
        },
        error:(error) =>{
          console.log(error);
          reject([])
        }
      });
    });
    return rolePromise;
  }

  public getMail() {
    const rolePromise = new Promise((resolve, reject) => {
      this.userSubject.subscribe((data: any) => {
        const { userService } = data;
        resolve(userService.email);
      });
    });
    return rolePromise;
  }

  public getDocument() {
    const rolePromise = new Promise((resolve, reject) => {
      this.userSubject.asObservable().subscribe((data: any) => {
        const { userService } = data;
        //console.log('Documento',userService);
        if(userService){
          resolve(userService.documento!);
        }else{
          reject(null)
        }
        
      });
    });
    return rolePromise;
  }

  public logoutValid() {
    var state;
    var valid = true;
    var queryString = location.search.substring(1);
    var regex = /([^&=]+)=([^&]*)/g;
    var m;
    while (!!(m = regex.exec(queryString))) {
      state = decodeURIComponent(m[2]);
    }
    if (this.localstorage.getData('state') === state) {
      this.clearStorage();
      valid = true;
    } else {
      valid = false;
    }
    return valid;
  }

  // el flag es un booleano que define si habrá boton de login
  public login(flag: boolean): boolean {
    if (this.localstorage.getData('id_token') === 'undefined' ||
      this.localstorage.getData('id_token') === null || this.logoutValid()) {
      if (!flag) {
        this.getAuthorizationUrl();
      }
      return false;
    } else {
      return true;
    }
  }

  public clearUrl() {
    const clean_uri = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, clean_uri);
  }

  public getAuthorizationUrl() {
    this.params = this.environment;
    if (!this.params.hasOwnProperty('nonce')) {
      const nonceData = this.generateState();
      this.params = { ...this.params, ...{ nonce: nonceData } };
    }
    if (!this.params.state) {
      this.params.state = this.generateState();
    }
    let url = this.params.AUTORIZATION_URL + '?' +
      'client_id=' + encodeURIComponent(this.params.CLIENTE_ID) + '&' +
      'redirect_uri=' + encodeURIComponent(this.params.REDIRECT_URL) + '&' + // + window.location.href + '&' para redirect con regex
      'response_type=' + encodeURIComponent(this.params.RESPONSE_TYPE) + '&' +
      'scope=' + encodeURIComponent(this.params.SCOPE) + '&' +
      'state_url=' + encodeURIComponent(window.location.hash);
    if (this.params.hasOwnProperty('nonce')) {
      url += '&nonce=' + encodeURIComponent(this.params.nonce);
    }
    url += '&state=' + encodeURIComponent(this.params.state);
    window.location.replace(url);
    return url;
  }

  public generateState(): any {
    const text = ((Date.now() + Math.random()) * Math.random()).toString().replace('.', '');
    return Md5.hashStr(text);
  }

  public setExpiresAt(): any {
    const expiresAt = this.localstorage.getData('expires_at');
    if (!expiresAt || expiresAt === 'Invalid Date') {
      const expiresAtDate = new Date();
      if (this.localstorage.getData('expires_in') != null) {
        const expires_in: string = this.localstorage.getData('expires_in')!;
        expiresAtDate.setSeconds(expiresAtDate.getSeconds() + parseInt(expires_in, 10));
        this.localstorage.saveData('expires_at', new Date(expiresAtDate).toUTCString());
      }
      return new Date(expiresAtDate);
    } else {
      return expiresAt === 'Invalid Date' ? false : new Date(expiresAt);
    }
  }

  autologout(expires: any): void {
    if (expires) {
      this.isLogin = true;
      const expiresIn = ((new Date(expires)).getTime() - (new Date()).getTime());
      if (expiresIn < this.timeLogoutBefore) {
        this.clearStorage();
        this.logoutSubject.next('logout-auto-only-localstorage');
        location.reload();
      } 
      // else {
      //   const timerDelay = expiresIn > this.timeLogoutBefore ? expiresIn - this.timeLogoutBefore : this.timeLogoutBefore;
      //   if (!isNaN(expiresIn)) {
      //     //console.log(`%cFecha expiración: %c${new Date(expires)}`, 'color: blue', 'color: green');
      //     of(null).pipe(delay(timerDelay - this.timeLogoutBefore)).subscribe((data) => {
      //       this.logout('logout-auto');
      //     });
      //     if (this.timeAlert < timerDelay) {
      //       of(null).pipe(delay(timerDelay - this.timeAlert)).subscribe((data) => {
      //         // Swal.fire({
      //         //     position: 'top-end',
      //         //     icon: 'info',
      //         //     title: `Su sesión se cerrará en ${this.timeAlert / 60000} minutos`,
      //         //     showConfirmButton: false,
      //         //     timer: this.timeActiveAlert
      //         // });
      //       });
      //     }
      //   }
      // }
    }
  }
  public expired() {
    return (new Date(this.localstorage.getData('expires_at')!) < new Date());
  }

  public live() {
    return this.isLogin;
  }

  public clearStorage() {
    this.isLogin = false;
    this.localstorage.clearData();
    window.sessionStorage.clear();
  }
}