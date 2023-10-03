import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms'
import { SyllabusService } from '../services/syllabus.service';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Estrategia, Evaluaciones, Syllabus, Tema, PFA, ObjetivoEspecifico } from 'src/app/@core/models/syllabus';
import { GestorDocumentalService } from '../services/gestor_documental.service';
import { Documento } from 'src/app/@core/models/documento';
import  {EmptySpaceValidator } from '../../@core/validators/emptyValue.validator'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-syllabus',
  templateUrl: './crear-syllabus.component.html',
  styleUrls: ['./crear-syllabus.component.scss']
})
export class CrearSyllabusComponent implements OnInit {
  Proyecto: ProyectoAcademico;
  PlanEstudio: PlanEstudio;
  EspacioAcademico: EspacioAcademico;
  Syllabus: Syllabus;
  isNew: Boolean;
  detalle_espacio_academico: any;
  formSaberesPrevios: FormGroup;
  formJustificacion: FormGroup;
  formObjetivos: FormGroup;
  formPFA: FormGroup;
  dataSourceFormPFA = new BehaviorSubject<AbstractControl[]>([]);
  formContenidosTematicos: FormGroup;
  formEstrategias: FormGroup;
  formEvaluacion: FormGroup;
  formMedios: FormGroup;
  formPracticasAcademicas: FormGroup;
  formBibliografia: FormGroup;
  dataSourceFormBiblioBas = new BehaviorSubject<AbstractControl[]>([]);
  dataSourceFormBiblioCom = new BehaviorSubject<AbstractControl[]>([]);
  dataSourceFormBiblioPag = new BehaviorSubject<AbstractControl[]>([]);
  formSeguimiento: FormGroup;
  formVigencia: FormGroup;
  formIdiomas: FormGroup;
  actaFile: File;
  idiomas: any[];
  filteredIdiomas: any[];

  formularios: FormArray = this._formBuilder.array([]);

  displayedColumnsFormPFA: string[] = ['numero', 'pfaPrograma', 'pfaAsignatura', 'competencias']

  displayedColumnsBibliografiaBasica: string[] = ['basicas']
  displayedColumnsBibliografiaComplementaria: string[] = ['complementarias']
  displayedColumnsBibliografiaPaginaWeb: string[] = ['paginasWeb']

  step: number = 0;

  get objetivosEspecificos() {
    return this.formObjetivos.get('objetivosEspecificos') as FormArray;
  }

  get pfa() {
    return this.formPFA.get('pfa') as FormArray;
  }

  get temas() {
    return this.formContenidosTematicos.get('temas') as FormArray;
  }

  subtemas(indexTema: number): FormArray {
    return this.temas.at(indexTema).get('subtemas') as FormArray;
  }

  get estrategias() {
    return this.formEstrategias.get('estrategias') as FormArray;
  }

  get evaluaciones() {
    return this.formEvaluacion.get('evaluaciones') as FormArray;
  }

  get basicas() {
    return this.formBibliografia.get('basicas') as FormArray
  }

  get complementarias() {
    return this.formBibliografia.get('complementarias') as FormArray
  }

  get paginasWeb() {
    return this.formBibliografia.get('paginasWeb') as FormArray
  }

  constructor(private _formBuilder: FormBuilder, private syllabusService: SyllabusService, private router: Router, private request: RequestManager, private gestorService: GestorDocumentalService) {
    this.syllabusService.proyectoAcademico$.subscribe((proyectoAcademico) => {
      this.Proyecto = proyectoAcademico;
    });
    this.syllabusService.planEstudios$.subscribe((planEstudio) => {
      this.PlanEstudio = planEstudio;
    });
    this.syllabusService.espacioAcademico$.subscribe((espacioAcademico) => {
      this.EspacioAcademico = espacioAcademico;
    });
    this.syllabusService.syllabus$.subscribe((syllabus) => {
      this.Syllabus = syllabus;
    })
    this.syllabusService.isNew$.subscribe((isNew) => {
      this.isNew = isNew;
    })
  }

  ngOnInit(): void {
    //console.log(this.Proyecto, this.PlanEstudio, this.EspacioAcademico);
    if (Object.keys(this.Proyecto).length === 0 || Object.keys(this.PlanEstudio).length === 0 || Object.keys(this.EspacioAcademico).length === 0) {
      this.router.navigate(['/buscar_syllabus'],{ skipLocationChange: true })
    } else {
      this.loadInfoIdentificacionEspacioAcademico();
      this.loadIdiomas();
      this.initForms();
    }
  }

  initForms(): void {
    console.log(this.Syllabus)
    this.formSaberesPrevios = this._formBuilder.group({
      saberesPrevios: [this.Syllabus.sugerencias && !this.isNew ? this.Syllabus.sugerencias : '', [Validators.required, Validators.minLength(1),EmptySpaceValidator.noEmptySpaceAllowed]]
    });

    this.formularios.controls.push(this.formSaberesPrevios);

    this.formJustificacion = this._formBuilder.group({
      justificacion: [this.Syllabus.justificacion && !this.isNew ? this.Syllabus.justificacion : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    });

    this.formularios.controls.push(this.formJustificacion);

    this.formObjetivos = this._formBuilder.group({
      objetivoGeneral: [this.Syllabus.objetivo_general && !this.isNew ? this.Syllabus.objetivo_general : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      objetivosEspecificos: this._formBuilder.array([

      ]),
    });

    this.formularios.controls.push(this.formObjetivos);

    this.formPFA = this._formBuilder.group({
      pfa: this._formBuilder.array([

      ], [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed])
    });

    this.formularios.controls.push(this.formPFA);

    this.formContenidosTematicos = this._formBuilder.group({
      descripcion: [this.Syllabus.contenido && !this.isNew ? this.Syllabus.contenido.descripcion : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      temas: this._formBuilder.array([

      ])
    });

    this.formularios.controls.push(this.formContenidosTematicos);


    this.formEstrategias = this._formBuilder.group({
      estrategias: this._formBuilder.array([
        // this._formBuilder.group({
        //   nombre: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
        //   descripcion: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
        //   pertinencia: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
        //   articulacion_ra: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
        // })
      ])
    });

    this.formularios.controls.push(this.formEstrategias);

    this.formEvaluacion = this._formBuilder.group({
      descripcion: [this.Syllabus.evaluacion && !this.isNew ? this.Syllabus.evaluacion.descripcion : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      evaluaciones: this._formBuilder.array([
        // this._formBuilder.group({
        //   nombre: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
        //   estrategia: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
        //   momento: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
        //   porcentaje: [0, [[Validators.required,EmptySpaceValidator.noEmptySpaceAllowed], Validators.min(0), Validators.max(100)]]
        // })
      ])
    })

    this.formularios.controls.push(this.formEvaluacion);

    this.formMedios = this._formBuilder.group({
      medios: [this.Syllabus.recursos_educativos && !this.isNew ? this.Syllabus.recursos_educativos : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formMedios);

    this.formPracticasAcademicas = this._formBuilder.group({
      practicasAcademicas: [this.Syllabus.practicas_academicas && !this.isNew ? this.Syllabus.practicas_academicas : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formPracticasAcademicas);

    this.formBibliografia = this._formBuilder.group({

      basicas: this._formBuilder.array([
        //['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
      ]),
      complementarias: this._formBuilder.array([
        //['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
      ]),
      paginasWeb: this._formBuilder.array([
        //['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
      ])
    })

    this.formularios.controls.push(this.formBibliografia);

    this.formSeguimiento = this._formBuilder.group({
      fechaRevisionConsejo: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      fechaAprobacionConsejo: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      numeroActa: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      archivo: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formSeguimiento);

    this.formVigencia = this._formBuilder.group({
      fechaInicio: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      fechaFin: ['']
    })

    this.formularios.controls.push(this.formVigencia);

    this.formIdiomas = this._formBuilder.group({
      idioma_espacio_id: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formIdiomas);

    if (this.isNew) {
      this.agregarObjetivoEspecifico();
      this.agregarPFA(undefined, false);
      this.agregarTema();
      this.agregarEstrategia(undefined);
      this.agregarEvalucion(undefined);
      this.agregarBibliografiaBasica(undefined, false);
      this.agregarBibliografiaComplementaria(undefined, false);
      this.agregarBibliografiaPaginaWeb(undefined, false);

    } else {
      this.formIdiomas.get('idioma_espacio_id')?.setValue(this.Syllabus.idioma_espacio_id);

      this.Syllabus.objetivos_especificos?.forEach((obj_esp) => {
        this.agregarObjetivoEspecifico(obj_esp);
      })
      this.Syllabus.resultados_aprendizaje?.forEach((pfa) => {
        this.agregarPFA(pfa, true);
      })
      this.updateViewTablePFA();
      this.Syllabus.contenido?.temas?.forEach((tema) => {
        this.agregarTema(tema);
      })
      this.Syllabus.estrategias?.forEach((estrategia) => {
        this.agregarEstrategia(estrategia);
      })
      this.Syllabus.evaluacion?.evaluaciones?.forEach((evaluacion) => {
        this.agregarEvalucion(evaluacion);
      })
      this.Syllabus.bibliografia?.basicas?.forEach((basica) => {
        this.agregarBibliografiaBasica(basica, true);
      })
      this.updateViewTableBiblioBas();
      this.Syllabus.bibliografia?.complementarias?.forEach((comple) => {
        this.agregarBibliografiaComplementaria(comple, true);
      })
      this.updateViewTableBiblioCom();
      this.Syllabus.bibliografia?.paginasWeb?.forEach((pagina) => {
        this.agregarBibliografiaPaginaWeb(pagina, true);
      })
      this.updateViewTableBiblioPag();
    }
  }

  validateForms() {
    let isValid:Boolean=true;
    console.log(this.formularios);
    this.formularios.controls.forEach(element => {
      console.log(element,element.valid)
      if(!element.valid){
        element.markAllAsTouched();
        isValid=false;
      }
    });
    return isValid
  }

  loadInfoIdentificacionEspacioAcademico() {
    this.request.get(environment.ACADEMICA_JBPM_SERVICE, 'detalle_espacio_academico/' + this.PlanEstudio.pen_nro + '/' + this.PlanEstudio.pen_cra_cod + '/' + this.EspacioAcademico.asi_cod).subscribe((dataDetalleEspacioAcademico) => {
      if (dataDetalleEspacioAcademico) {
        //console.log(dataDetalleEspacioAcademico);
        this.detalle_espacio_academico = dataDetalleEspacioAcademico.espacios_academicos.espacio_academico[0];
      }
    })
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  agregarObjetivoEspecifico(obj?: ObjetivoEspecifico) {
    const objeEsp = this._formBuilder.group({
      objetivo: [obj?.objetivo ? obj.objetivo : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })
    this.objetivosEspecificos.push(objeEsp);
  }

  eliminarObjetivoEspecifico(index: number) {
    this.objetivosEspecificos.removeAt(index);
  }

  agregarPFA(d?: PFA, noUpdate?: boolean) {
    const rowPFA = this._formBuilder.group({
      pfa_programa: [d && d.pfa_programa ? d.pfa_programa : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      pfa_asignatura: [d && d.pfa_asignatura ? d.pfa_asignatura : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      competencias: [d && d.competencias ? d.competencias : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })
    this.pfa.push(rowPFA);
    if (!noUpdate) { this.updateViewTablePFA(); }
  }

  eliminarPFA(index: number) {
    //console.log(index);
    //console.log(this.pfa)
    this.pfa.removeAt(index);
    //console.log(this.pfa)
    this.updateViewTablePFA();
  }

  updateViewTablePFA() {
    this.dataSourceFormPFA.next(this.pfa.controls);
    //console.log(this.dataSourceFormPFA);
  }

  agregarTema(tema?: Tema) {
    const formTema = this._formBuilder.group({
      nombre: [tema ? tema.nombre : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      subtemas: this._formBuilder.array(
        []
      )
    })
    this.temas.push(formTema);
    if (tema && tema.subtemas) {
      tema?.subtemas.forEach((subtema) => {
        this.agregarSubTema(this.temas.length - 1, subtema)
      })
    } else {
      this.agregarSubTema(this.temas.length - 1);
    }
    //console.log(this.subtemas(0));
    //console.log(this.formContenidosTematicos);
  }

  eliminarTema(index: number) {
    this.temas.removeAt(index);
  }

  agregarSubTema(indexTema: number, subTema?: string) {
    const subTem: FormControl = this._formBuilder.control(subTema ? subTema : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]);
    this.subtemas(indexTema).push(subTem);
  }

  eliminarSubTema(indexTema: number, indexSubTema: number) {
    this.subtemas(indexTema).removeAt(indexSubTema);
  }

  agregarEstrategia(d?: Estrategia) {
    const formestrategia = this._formBuilder.group({
      nombre: [d ? d.nombre : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      descripcion: [d ? d.descripcion : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      pertinencia: [d ? d.pertinencia : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      articulacion_ra: [d ? d.articulacion_ra : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })
    this.estrategias.push(formestrategia);
  }

  eliminarEstrategia(index: number) {
    this.estrategias.removeAt(index);
  }

  agregarEvalucion(d?: Evaluaciones) {
    const formEvaluacion = this._formBuilder.group({
      nombre: [d ? d.nombre : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      estrategia: [d ? d.estrategia : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      momento: [d ? d.momento : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      porcentaje: [d ? d.porcentaje : 0, [Validators.required, Validators.min(0), Validators.max(100),EmptySpaceValidator.noEmptySpaceAllowed]]
    })
    this.evaluaciones.push(formEvaluacion);
  }

  eliminarEvaluacion(index: number) {
    this.evaluaciones.removeAt(index);
  }

  agregarBibliografiaBasica(d?: string, noUpdate?: boolean) {
    const formBiblioBas = this._formBuilder.control(d ? d : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]);
    this.basicas.push(formBiblioBas);
    if (!noUpdate) { this.updateViewTableBiblioBas(); }
  }

  eliminarBibliografiaBasica(index: number) {
    this.basicas.removeAt(index);
    this.updateViewTableBiblioBas();
  }

  updateViewTableBiblioBas() {
    console.log('basicas',this.basicas);
    this.dataSourceFormBiblioBas.next(this.basicas.controls);
    //console.log(this.dataSourceFormBiblioBas);
  }

  agregarBibliografiaComplementaria(d?: string, noUpdate?: boolean) {
    const formBiblioCom = this._formBuilder.control(d ? d : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]);
    this.complementarias.push(formBiblioCom);
    if (!noUpdate) { this.updateViewTableBiblioCom(); }
  }

  eliminarBibliografiaComplementaria(index: number) {
    this.complementarias.removeAt(index);
    this.updateViewTableBiblioCom();
  }

  updateViewTableBiblioCom() {
    this.dataSourceFormBiblioCom.next(this.complementarias.controls);
    //console.log(this.dataSourceFormBiblioCom);
  }

  agregarBibliografiaPaginaWeb(d?: string, noUpdate?: boolean) {
    const formBiblioPag = this._formBuilder.control(d ? d : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]);
    this.paginasWeb.push(formBiblioPag);
    if (!noUpdate) { this.updateViewTableBiblioPag(); }
  }

  eliminarBibliografiaPaginaWeb(index: number) {
    this.paginasWeb.removeAt(index);
    this.updateViewTableBiblioPag();
  }

  updateViewTableBiblioPag() {
    this.dataSourceFormBiblioPag.next(this.paginasWeb.controls);
    //console.log(this.dataSourceFormBiblioPag);
  }


  SubmitSyllabus() {
    const syllabus: Syllabus = new Syllabus();
    console.log(this.validateForms());
    if (this.validateForms()) {
      Swal.fire({
        title: this.isNew?'Creando Syllabus':'Editando Syllabus',
        html: `Por favor espere`,
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.uploadActa().subscribe({
        next: (respuesta: any) => {
          syllabus.espacio_academico_id = Number(this.EspacioAcademico.asi_cod);
          syllabus.proyecto_curricular_id = Number(this.PlanEstudio.pen_cra_cod);
          syllabus.plan_estudios_id = Number(this.PlanEstudio.pen_nro);
          if(this.Syllabus.syllabus_code && !this.isNew){
            syllabus.syllabus_code=this.Syllabus.syllabus_code;
          }
          syllabus.idioma_espacio_id = this.formIdiomas.get('idioma_espacio_id')?.value;
          syllabus.sugerencias = this.formSaberesPrevios.get('saberesPrevios')?.value;
          syllabus.justificacion = this.formJustificacion.get('justificacion')?.value;
          syllabus.objetivo_general = this.formObjetivos.get('objetivoGeneral')?.value;
          syllabus.objetivos_especificos = this.objetivosEspecificos.value;
          // this.objetivosEspecificos.controls.forEach(obj_esp => {
          //   syllabus.objetivos_especificos.push(obj_esp.get('objetivo')?.value);
          // });
          syllabus.resultados_aprendizaje = this.pfa.value;
          syllabus.contenido = this.formContenidosTematicos.value;
          syllabus.estrategias = this.estrategias.value;
          syllabus.evaluacion = this.formEvaluacion.value;
          syllabus.recursos_educativos = this.formMedios.get('medios')?.value;
          syllabus.practicas_academicas = this.formPracticasAcademicas.get('practicasAcademicas')?.value;
          syllabus.bibliografia = this.formBibliografia.value;
          syllabus.seguimiento = this.formSeguimiento.value;
          syllabus.seguimiento.archivo = respuesta.res.Enlace
          syllabus.vigencia = this.formVigencia.value;
          //console.log(syllabus);
          this.request.post(environment.SYLLABUS_CRUD, 'syllabus', syllabus).subscribe({
            next: (respuesta: any) => {
              //console.log(respuesta);
              Swal.close();
              Swal.fire({
                icon: 'success',
                title: this.isNew?'Creación exitosa':'Edición exitosa',
              })
              this.router.navigate(['/buscar_syllabus'], { skipLocationChange: true });
            },
            error: (error) => {
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: this.isNew?'Fallo la creación del syllabus':'Fallo la edición del syllabus',
              })
            }
          })
        },
        error: (error: Error) => {
          //console.error(error)
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Fallo la carga de los documentos',
          })
        }
      });
    }else{
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        html: `Por favor llene los campos requeridos`
      })
    }
  }

  handleFileInputActaChange(event: any): void {
    this.actaFile = event.target.files[0] ?? null;
    //console.log(this.actaFile);
    if (this.actaFile && this.actaFile.type == "application/pdf") {
      this.formSeguimiento.get('archivo')?.patchValue(this.actaFile.name);
    } else {
      this.formSeguimiento.get('archivo')?.setErrors({ 'incorrect': true });
    }
  }

  uploadActa(): Observable<Documento> {
    const sendActa = {
      IdDocumento: 74,
      nombre: (this.actaFile.name).split('.')[0],
      metadatos: {
        proyecto: this.Proyecto.Nombre,
        plan_estudio: this.PlanEstudio.pen_nro,
        espacio_academico: this.EspacioAcademico.asi_nombre
      },
      descripcion: "Acta de consejo curricular para nuevo syllabus",
      file: this.actaFile
    }
    return this.gestorService.uploadFiles(sendActa)
  }

  regresar() {
    this.router.navigate(['/buscar_syllabus'], { skipLocationChange: true })
  }

  loadIdiomas() {
    this.request.get(environment.IDIOMAS_CRUD, 'idioma?limit=-1').subscribe((dataidiomas) => {
      //console.log(dataidiomas)
      this.idiomas = dataidiomas;
      this.filteredIdiomas = dataidiomas;
    })
  }

  onKeySearchIdioma(value: string) {
    if (value === "") {
      this.filteredIdiomas = this.idiomas;
    } else {
      this.filteredIdiomas = this.search(value)!;
    }
  }

  search(value: string) {
    let filter = value.toLowerCase();
    if (this.idiomas != undefined) {
      return this.idiomas.filter(option => option.Nombre.toLowerCase().startsWith(filter));
    }
    return []
  }

  onChangeIdioma(idioma_id: any) {
    //console.log(idioma_id);
    //console.log(this.formIdiomas.get('idioma_espacio_id')?.value)
  }
}
