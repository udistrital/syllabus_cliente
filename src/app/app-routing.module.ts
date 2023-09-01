import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuscarSyllabusComponent } from './pages/buscar-syllabus/buscar-syllabus.component';
import { ListarSyllabusComponent } from './pages/listar-syllabus/listar-syllabus.component';
import { CrearSyllabusComponent } from './pages/crear-syllabus/crear-syllabus.component';

const routes: Routes = [
    { path: '', redirectTo: 'buscar_syllabus', pathMatch: 'full' },
    { path: 'buscar_syllabus',component:BuscarSyllabusComponent},
    { path: 'listar_syllabus',component:ListarSyllabusComponent},
    { path: 'crear_syllabus',component:CrearSyllabusComponent}
  ];
  
  @NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
  })
  export class AppRoutingModule {}