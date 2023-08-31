import { Component } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms'

interface Opcion {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-buscar-syllabus',
  templateUrl: './buscar-syllabus.component.html',
  styleUrls: ['./buscar-syllabus.component.css']
})
export class BuscarSyllabusComponent {
  formGroup = this._formBuilder.group({
    facultadCtrl: ['', Validators.required],
    ProyectoCurricularCtrl: ['',Validators.required],
    PlanEstudiosCtrl: ['',Validators.required],
    EspacioAcademicoCtrl: ['']
  });

  facultades: Opcion[] = [
    {value: '1', viewValue: 'Ingenieria'},
    {value: '2', viewValue: 'Macarena'},
    {value: '3', viewValue: 'Vivero'},
  ];

  proyectos_curriculares: Opcion[] = [
    {value: '1', viewValue: 'Ingenieria de sistemas'},
    {value: '2', viewValue: 'quimica'},
    {value: '3', viewValue: 'licenciatura'},
  ];

  planes_estudio: Opcion[] = [
    {value: '1', viewValue: 'A'},
    {value: '2', viewValue: 'B'},
    {value: '3', viewValue: 'C'},
  ];

  espacios_academicos: Opcion[] = [
    {value: '1', viewValue: 'matematicas'},
    {value: '2', viewValue: 'etica'},
    {value: '3', viewValue: 'catedra'},
  ];

  constructor(private _formBuilder: FormBuilder) {}
}
