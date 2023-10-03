import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
  
  @NgModule({
    imports: [ RouterModule.forRoot(routes, {
      useHash: true,
      //enableTracing: true,
      initialNavigation: 'disabled'
    }) ],
    exports: [ RouterModule ]
  })
  export class AppRoutingModule {}