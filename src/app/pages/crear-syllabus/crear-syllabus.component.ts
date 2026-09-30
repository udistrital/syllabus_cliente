import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms'
import { SyllabusService } from '../services/syllabus.service';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { UserService } from '../services/userService';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Syllabus, PFA, ObjetivoEspecifico } from 'src/app/@core/models/syllabus';
import { GestorDocumentalService } from '../services/gestor_documental.service';
import { Documento } from 'src/app/@core/models/documento';
import  {EmptySpaceValidator } from '../../@core/validators/emptyValue.validator'
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';

const EVALUACION_DESCRIPCION = 'En términos de organización de los cortes evaluativos, la Universidad establece:';
const EVALUACION_CORTES = [
  { nombre: 'Corte 1', porcentaje: 35 },
  { nombre: 'Corte 2', porcentaje: 35 },
  { nombre: 'Evaluación Final', porcentaje: 30 },
];

const CARACTERES = ['Teórico', 'Práctico', 'Teórico-práctico'];
const MODALIDADES = ['Presencial', 'Virtual', 'Dual', 'Híbrida'];

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
  formMedios: FormGroup;
  formPracticasAcademicas: FormGroup;
  formBibliografia: FormGroup;
  dataSourceFormBiblioBas = new BehaviorSubject<AbstractControl[]>([]);
  dataSourceFormBiblioCom = new BehaviorSubject<AbstractControl[]>([]);
  dataSourceFormBiblioBases = new BehaviorSubject<AbstractControl[]>([]);
  dataSourceFormBiblioPag = new BehaviorSubject<AbstractControl[]>([]);
  formSeguimiento: FormGroup;
  formIdiomas: FormGroup;
  actaFile: File;
  idiomas: any[];
  filteredIdiomas: any[];
  actaPrevia: { uid: string | null, url: string | null } = { uid: null, url: null };

  formularios: FormArray = this._formBuilder.array([]);

  evaluacionDescripcion = EVALUACION_DESCRIPCION;
  evaluacionCortes = EVALUACION_CORTES;
  caracteres = CARACTERES;
  modalidades = MODALIDADES;

  displayedColumnsFormPFA: string[] = ['numero', 'pfaPrograma']

  displayedColumnsBibliografiaBasica: string[] = ['basicas']
  displayedColumnsBibliografiaComplementaria: string[] = ['complementarias']
  displayedColumnsBibliografiaBases: string[] = ['bases']
  displayedColumnsBibliografiaPaginaWeb: string[] = ['paginasWeb']

  step: number = 0;

  get objetivosEspecificos() {
    return this.formObjetivos.get('objetivosEspecificos') as FormArray;
  }

  get pfa() {
    return this.formPFA.get('pfa') as FormArray;
  }

  get basicas() {
    return this.formBibliografia.get('basicas') as FormArray
  }

  get complementarias() {
    return this.formBibliografia.get('complementarias') as FormArray
  }

  get bases() {
    return this.formBibliografia.get('bases') as FormArray
  }

  get paginasWeb() {
    return this.formBibliografia.get('paginasWeb') as FormArray
  }

  constructor(private _formBuilder: FormBuilder, private syllabusService: SyllabusService, private router: Router, private request: RequestManager, private gestorService: GestorDocumentalService, private userService: UserService) {
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
      descripcion: [this.Syllabus.contenido && !this.isNew ? this.Syllabus.contenido.descripcion : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    });

    this.formularios.controls.push(this.formContenidosTematicos);

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
      bases: this._formBuilder.array([
        //['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
      ]),
      paginasWeb: this._formBuilder.array([
        //['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
      ])
    })

    this.formularios.controls.push(this.formBibliografia);

    this.formSeguimiento = this._formBuilder.group({
      numeroActa: [!this.isNew ? this.Syllabus.seguimiento.numeroActa : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      archivo: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]] // loaded in handleFileInputActaChange()
    })

    this.formularios.controls.push(this.formSeguimiento);

    this.formIdiomas = this._formBuilder.group({
      idioma_espacio_id: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formIdiomas);

    if (this.isNew) {
      this.agregarObjetivoEspecifico();
      this.agregarPFA(undefined, false);
      this.agregarBibliografiaBasica(undefined, false);
      this.agregarBibliografiaComplementaria(undefined, false);
      this.agregarBibliografiaBase(undefined, false);
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
      this.Syllabus.bibliografia?.basicas?.forEach((basica) => {
        this.agregarBibliografiaBasica(basica, true);
      })
      this.updateViewTableBiblioBas();
      this.Syllabus.bibliografia?.complementarias?.forEach((comple) => {
        this.agregarBibliografiaComplementaria(comple, true);
      })
      this.updateViewTableBiblioCom();
      this.Syllabus.bibliografia?.bases?.forEach((base) => {
        this.agregarBibliografiaBase(base, true);
      })
      this.updateViewTableBiblioBases();
      this.Syllabus.bibliografia?.paginasWeb?.forEach((pagina) => {
        this.agregarBibliografiaPaginaWeb(pagina, true);
      })
      this.updateViewTableBiblioPag();

      if (this.Syllabus.seguimiento.archivo) {
        this.actaPrevia = { uid: null, url: null };
        this.gestorService.getByUUID(this.Syllabus.seguimiento.archivo).subscribe({
        next:(document)=>{
          this.actaPrevia.uid = this.Syllabus.seguimiento.archivo;
          this.actaPrevia.url = document;

          this.formSeguimiento.get('archivo')?.patchValue(this.ver('Acta')+'.pdf');
        },
        error:()=>{
          Swal.fire({
            icon:'error',
            title:'Error',
            text:'ocurrió un error al cargar el documento'
          })
        }
      });
      } else {
        this.actaPrevia = {uid: null, url: null};
      }
    }
  }

  validateForms() {
    let isValid:Boolean=true;
    this.formularios.controls.forEach(element => {
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
    const isFirst = this.objetivosEspecificos.length === 0;
    const validators = isFirst ? [Validators.required, EmptySpaceValidator.noEmptySpaceAllowed] : [];
    const objeEsp = this._formBuilder.group({
      objetivo: [obj?.objetivo ? obj.objetivo : '', validators]
    })
    this.objetivosEspecificos.push(objeEsp);
  }

  eliminarObjetivoEspecifico(index: number) {
    this.objetivosEspecificos.removeAt(index);
  }

  agregarPFA(d?: PFA, noUpdate?: boolean) {
    const rowPFA = this._formBuilder.group({
      pfa_programa: [d && d.pfa_programa ? d.pfa_programa : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })
    this.pfa.push(rowPFA);
    if (!noUpdate) { this.updateViewTablePFA(); }
  }

  eliminarPFA(index: number) {
    this.pfa.removeAt(index);
    this.updateViewTablePFA();
  }

  updateViewTablePFA() {
    this.dataSourceFormPFA.next(this.pfa.controls);
  }

  agregarBibliografiaBasica(d?: string, noUpdate?: boolean) {
    const isFirst = this.basicas.length === 0;
    const validators = isFirst ? [Validators.required, EmptySpaceValidator.noEmptySpaceAllowed] : [];
    const formBiblioBas = this._formBuilder.control(d ? d : '', validators);
    this.basicas.push(formBiblioBas);
    if (!noUpdate) { this.updateViewTableBiblioBas(); }
  }

  eliminarBibliografiaBasica(index: number) {
    this.basicas.removeAt(index);
    this.updateViewTableBiblioBas();
  }

  updateViewTableBiblioBas() {
    this.dataSourceFormBiblioBas.next(this.basicas.controls);
  }

  agregarBibliografiaComplementaria(d?: string, noUpdate?: boolean) {
    const formBiblioCom = this._formBuilder.control(d ? d : '');
    this.complementarias.push(formBiblioCom);
    if (!noUpdate) { this.updateViewTableBiblioCom(); }
  }

  eliminarBibliografiaComplementaria(index: number) {
    this.complementarias.removeAt(index);
    this.updateViewTableBiblioCom();
  }

  updateViewTableBiblioCom() {
    this.dataSourceFormBiblioCom.next(this.complementarias.controls);
  }

  agregarBibliografiaBase(d?: string, noUpdate?: boolean) {
    const formBiblioBase = this._formBuilder.control(d ? d : '');
    this.bases.push(formBiblioBase);
    if (!noUpdate) { this.updateViewTableBiblioBases(); }
  }

  eliminarBibliografiaBase(index: number) {
    this.bases.removeAt(index);
    this.updateViewTableBiblioBases();
  }

  updateViewTableBiblioBases() {
    this.dataSourceFormBiblioBases.next(this.bases.controls);
  }

  agregarBibliografiaPaginaWeb(d?: string, noUpdate?: boolean) {
    const formBiblioPag = this._formBuilder.control(d ? d : '');
    this.paginasWeb.push(formBiblioPag);
    if (!noUpdate) { this.updateViewTableBiblioPag(); }
  }

  eliminarBibliografiaPaginaWeb(index: number) {
    this.paginasWeb.removeAt(index);
    this.updateViewTableBiblioPag();
  }

  updateViewTableBiblioPag() {
    this.dataSourceFormBiblioPag.next(this.paginasWeb.controls);
  }

  private buildEvaluacion() {
    return {
      descripcion: EVALUACION_DESCRIPCION,
      evaluaciones: EVALUACION_CORTES.map(corte => ({ nombre: corte.nombre, porcentaje: corte.porcentaje }))
    };
  }

  private buildSyllabusPayload(archivoEnlace: string): any {
    let syllabus: any = {};
    if (!this.isNew && this.Syllabus) {
      syllabus = { ...this.Syllabus };
    }

    // Campos gestionados por el CRUD o eliminados en el nuevo formato
    delete syllabus.articulacion_resultados_aprendizaje;
    delete syllabus._id;
    delete syllabus.version;
    delete syllabus.syllabus_actual;
    delete syllabus.activo;
    delete syllabus.fecha_creacion;
    delete syllabus.fecha_modificacion;
    delete syllabus.estrategias;
    delete syllabus.vigencia;
    if (syllabus.seguimiento) {
      delete syllabus.seguimiento.elaboracion;
    }

    const pen_cra_cod = Number(this.PlanEstudio.pen_cra_cod);
    const pen_nro = Number(this.PlanEstudio.pen_nro);

    syllabus.espacio_academico_id = Number(this.EspacioAcademico.asi_cod);
    syllabus.tercero_id = Number(localStorage.getItem('persona_id'));

    const proyectoIds = Array.isArray(syllabus.proyecto_curricular_ids) ? [...syllabus.proyecto_curricular_ids] : [];
    if (!proyectoIds.includes(pen_cra_cod)) {
      proyectoIds.push(pen_cra_cod);
    }
    syllabus.proyecto_curricular_ids = proyectoIds;

    const planIds = Array.isArray(syllabus.plan_estudios_ids) ? [...syllabus.plan_estudios_ids] : [];
    if (!planIds.includes(pen_nro)) {
      planIds.push(pen_nro);
    }
    syllabus.plan_estudios_ids = planIds;

    syllabus.idioma_espacio_id = this.formIdiomas.get('idioma_espacio_id')?.value;
    syllabus.sugerencias = this.formSaberesPrevios.get('saberesPrevios')?.value;
    syllabus.justificacion = this.formJustificacion.get('justificacion')?.value;
    syllabus.objetivo_general = this.formObjetivos.get('objetivoGeneral')?.value;
    syllabus.objetivos_especificos = this.objetivosEspecificos.value;
    syllabus.resultados_aprendizaje = this.pfa.value;
    syllabus.contenido = { descripcion: this.formContenidosTematicos.get('descripcion')?.value };
    syllabus.evaluacion = this.buildEvaluacion();
    syllabus.recursos_educativos = this.formMedios.get('medios')?.value;
    syllabus.practicas_academicas = this.formPracticasAcademicas.get('practicasAcademicas')?.value;
    syllabus.bibliografia = this.formBibliografia.value;

    const nombre = this.userService.getNombreCompleto();
    const fechaEdicion = new Date().toISOString();
    syllabus.seguimiento = {
      elaboro: nombre,
      reviso: nombre,
      aprobo: nombre,
      fecha_elaboro: fechaEdicion,
      fechaRevisionConsejo: fechaEdicion,
      fechaAprobacionConsejo: fechaEdicion,
      numeroActa: this.formSeguimiento.get('numeroActa')?.value,
      archivo: archivoEnlace
    };

    return syllabus;
  }

  createNewVersionSyllabus(){
    Swal.fire({
      title: this.isNew?'Creando Syllabus':'Editando Syllabus',
      html: `Por favor espere`,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    try {
      this.uploadActa().subscribe({
        next: (respuesta: any) => {
          try {
            const syllabus = this.buildSyllabusPayload(respuesta?.res?.Enlace);
            this.request.post(environment.SYLLABUS_CRUD, 'syllabus', syllabus).subscribe({
              next: (respuesta: any) => {
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
          } catch (error: any) {
            Swal.close();
            console.error('Error al construir el payload del syllabus:', error?.stack || error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: this.isNew?'Fallo la creación del syllabus':'Fallo la edición del syllabus',
            })
          }
        },
        error: (error: Error) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Fallo la carga de los documentos',
          })
        }
      });
    } catch (error: any) {
      Swal.close();
      console.error('Error al cargar el acta:', error?.stack || error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Fallo la carga de los documentos',
      })
    }
  }

  SubmitSyllabus() {
    if (this.validateForms()) {
      this.createNewVersionSyllabus();
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
    let name = "";
    let incorrect = false;
    if (this.actaFile) {
      name = this.actaFile.name;
      if (this.actaFile.type != "application/pdf") {
        incorrect = true;
      }
    } else if (this.actaPrevia.uid) {
      name = this.ver('Acta')+'.pdf';
      incorrect = false;
    } else {
      incorrect = true;
    }
    this.formSeguimiento.get('archivo')?.patchValue(name);
    if (incorrect) {
      this.formSeguimiento.get('archivo')?.setErrors({ 'incorrect': true });
   }
  }

  uploadActa(): Observable<Documento> {
    if (!this.actaFile && this.actaPrevia.uid) {
      const doc: any = {res: {Enlace: this.actaPrevia.uid}};
      return of(doc)
    }
    if (!this.actaFile) {
      return throwError(() => new Error('No hay archivo de acta para cargar'));
    }
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
    this.request.get(environment.IDIOMAS_CRUD, 'idioma?query=Id.in:1|2|49|72|53|130|32').subscribe((dataidiomas) => {
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

  ver(text: string): string {
    return text + ' versión ' + ((this.Syllabus.version - 1)||1);
  }

  formatDate(date: string | null): string {
    if (date) {
      return date.split('T')[0];
    } else {
      return "Sin definir";
    }
  }

  fechaActual(): string {
    return new Date().toISOString().split('T')[0];
  }

  previewFile(){
    if (this.isNew) {
      if (this.actaFile) {
        window.open(URL.createObjectURL(this.actaFile));
      }
    } else {
      if(this.actaFile) {
        window.open(URL.createObjectURL(this.actaFile));
      } else if (this.actaPrevia.url) {
        window.open(this.actaPrevia.url)
      }
    }
  }

  existFile() {
    return !(this.actaFile || this.actaPrevia.url);
  }
}
