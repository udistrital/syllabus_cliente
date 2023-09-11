import { Component } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms'

@Component({
  selector: 'app-crear-syllabus',
  templateUrl: './crear-syllabus.component.html',
  styleUrls: ['./crear-syllabus.component.scss']
})
export class CrearSyllabusComponent {
  formGroupIdentificacionEspacio = this._formBuilder.group({
    NombreEspacioAcademicoCtrl: [''],
    NaturalezaEspacioAcademicoCtrl: [''],
    CaracterEspacioAcademicoCtrl: [''],
    ModalidadOfertaEspacioCtrl: ['']
  });

  displayedColumns: string[] = ['fechaInicio', 'inputFechaInicio', 'fechaFin', 'inputFechaFin']
  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  constructor(private _formBuilder: FormBuilder) {}
}
