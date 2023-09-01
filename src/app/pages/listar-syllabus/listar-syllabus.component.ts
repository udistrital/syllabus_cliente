import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-listar-syllabus',
  templateUrl: './listar-syllabus.component.html',
  styleUrls: ['./listar-syllabus.component.css']
})
export class ListarSyllabusComponent {
  displayedColumns: string[] = ['proyecto', 'plan_estudios', 'semestre', 'espacio_academico', 'grupo','acciones_buttons'];
  displayedHeaders: string[] = [ 'resultadosConsulta','acciones'];
  dataSource = new MatTableDataSource<Syllabus>(SYLLABUS_DATA);
}

export interface Syllabus {
  proyecto: string;
  plan_estudios: string;
  semestre: string;
  espacio_academico: string;
  grupo: string
}

const SYLLABUS_DATA: Syllabus[] = [
  { proyecto: 'proyecto 1', plan_estudios: 'plan estudios 1', semestre: '2023-3', espacio_academico: 'espacio 1', grupo: '1' },
  { proyecto: 'proyecto 2', plan_estudios: 'plan estudios 2', semestre: '2023-3', espacio_academico: 'espacio 2', grupo: '2' },
  { proyecto: 'proyecto 3', plan_estudios: 'plan estudios 3', semestre: '2023-3', espacio_academico: 'espacio 3', grupo: '3' },
  { proyecto: 'proyecto 4', plan_estudios: 'plan estudios 4', semestre: '2023-3', espacio_academico: 'espacio 4', grupo: '4' },
  { proyecto: 'proyecto 5', plan_estudios: 'plan estudios 5', semestre: '2023-3', espacio_academico: 'espacio 5', grupo: '5' },
]
