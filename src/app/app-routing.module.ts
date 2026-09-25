import { NgModule } from '@angular/core';
import { APP_BASE_HREF, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { environment } from 'src/environments/environment';
import { BuscarSyllabusComponent } from './pages/buscar-syllabus/buscar-syllabus.component';
import { ListarSyllabusComponent } from './pages/listar-syllabus/listar-syllabus.component';
import { CrearSyllabusComponent } from './pages/crear-syllabus/crear-syllabus.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
    { path: 'buscar_syllabus',component:BuscarSyllabusComponent},
    { path: 'listar_syllabus',component:ListarSyllabusComponent},
    { path: 'crear_syllabus',component:CrearSyllabusComponent},
    { path: 'dashboard', component:DashboardComponent},
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'dashboard'}
  ];

const isMicrofrontend = environment.microfrontend === true;

const routerOptions: ExtraOptions = isMicrofrontend
  ? { useHash: false }
  : { useHash: true, initialNavigation: 'disabled' };

  @NgModule({
    imports: [ RouterModule.forRoot(routes, routerOptions) ],
    exports: [ RouterModule ],
    providers: isMicrofrontend
      ? [ getSingleSpaExtraProviders(), { provide: APP_BASE_HREF, useValue: '/syllabus/' } ]
      : [ { provide: LocationStrategy, useClass: HashLocationStrategy } ]
  })
  export class AppRoutingModule {}
