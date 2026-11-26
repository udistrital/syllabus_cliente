import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SyllabusService } from '../services/syllabus.service';
import { FlujoService } from '../services/flujo.service';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { UserService } from '../services/userService';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Syllabus, PFA, ObjetivoEspecifico, PFAModo } from 'src/app/@core/models/syllabus';
import { GestorDocumentalService } from '../services/gestor_documental.service';
import { Documento } from 'src/app/@core/models/documento';
import  {EmptySpaceValidator } from '../../@core/validators/emptyValue.validator'
import { RichTextValidator } from '../../@core/validators/richText.validator';
import { MAX_FILAS_MATRIZ_PFA, PFAValidator } from '../../@core/validators/pfa.validator';
import { htmlToText, normalizeRichTextValue, sanitizeRichText } from '../../@core/utils/html-editor.utils';
import {
  aplicarDatosPropuesta,
  debeActualizarEnSitio,
  esPropuestaSyllabus,
  extraerContenidoPropuesta,
} from '../../@core/utils/propuesta.utils';
import { ImportarPropuestaComponent } from '../importar-propuesta/importar-propuesta.component';
import { fechaCorta } from 'src/app/@core/utils/flujo.helpers';
import * as moment from 'moment';
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
const MAX_CARACTERES_JUSTIFICACION = 1200;
const MAX_OBJETIVOS_ESPECIFICOS = 4;
const MODO_PFA_LISTADO: PFAModo = 'listado';
const MODO_PFA_MATRIZ: PFAModo = 'matriz';
const MAX_COLUMNAS_MATRIZ_PFA = 5;
const ENCABEZADO_MATRIZ_PFA = 'Propósitos de Formación y Aprendizaje PFA';

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
  isNew: boolean;
  flujoMode: boolean = false;
  flujoCode: string = '';
  flujoEstado: string = '';
  detalle_espacio_academico: any;
  modoPropuesta: boolean = false;
  formPropuesta: FormGroup;
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
  maxCaracteresJustificacion = MAX_CARACTERES_JUSTIFICACION;
  maxObjetivosEspecificos = MAX_OBJETIVOS_ESPECIFICOS;
  modoPFA: PFAModo = MODO_PFA_LISTADO;
  maxFilasMatrizPFA = MAX_FILAS_MATRIZ_PFA;
  maxColumnasMatrizPFA = MAX_COLUMNAS_MATRIZ_PFA;
  encabezadoMatrizPFA = ENCABEZADO_MATRIZ_PFA;

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

  constructor(private _formBuilder: FormBuilder, private syllabusService: SyllabusService, private router: Router, private request: RequestManager, private gestorService: GestorDocumentalService, private userService: UserService, private flujoService: FlujoService, private dialog: MatDialog, private translate: TranslateService) {
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
    this.syllabusService.flujoDraft$.subscribe((flujo) => {
      this.flujoMode = !!flujo;
      this.flujoCode = flujo ? flujo.code : '';
      this.flujoEstado = flujo ? flujo.estado : '';
    });
    this.syllabusService.modoPropuesta$.subscribe((modo) => {
      this.modoPropuesta = modo;
    });
  }

  ngOnInit(): void {
    //console.log(this.Proyecto, this.PlanEstudio, this.EspacioAcademico);
    // En modo propuesta el espacio académico todavía no existe: basta con el
    // proyecto curricular y el plan de estudios.
    const faltaEspacio = !this.modoPropuesta && Object.keys(this.EspacioAcademico).length === 0;
    if (Object.keys(this.Proyecto).length === 0 || Object.keys(this.PlanEstudio).length === 0 || faltaEspacio) {
      this.router.navigate(['/buscar_syllabus'],{ skipLocationChange: true })
    } else {
      if (!this.modoPropuesta) {
        this.loadInfoIdentificacionEspacioAcademico();
      }
      this.loadIdiomas();
      this.initForms();
    }
  }

  initForms(): void {
    // Al abrir una propuesta guardada se recupera el modo desde el documento.
    if (esPropuestaSyllabus(this.Syllabus)) {
      this.modoPropuesta = true;
      this.syllabusService.setModoPropuesta(true);
    }

    // Datos de identificación de la propuesta: solo aplican en modo propuesta.
    const esPropuesta = this.modoPropuesta;
    const nombrePropuesta = esPropuesta && !this.isNew && this.Syllabus.propuesta_nombre
      ? this.Syllabus.propuesta_nombre
      : '';
    const creditosPropuesta = esPropuesta && !this.isNew && this.Syllabus.propuesta_creditos
      ? this.Syllabus.propuesta_creditos
      : null;

    this.formPropuesta = this._formBuilder.group({
      propuesta_nombre: [
        nombrePropuesta,
        esPropuesta ? [Validators.required, EmptySpaceValidator.noEmptySpaceAllowed] : [],
      ],
      propuesta_creditos: [
        creditosPropuesta,
        esPropuesta ? [Validators.required, Validators.min(1)] : [],
      ],
    });

    this.formularios.controls.push(this.formPropuesta);

    this.formSaberesPrevios = this._formBuilder.group({
      saberesPrevios: ['', [Validators.required, Validators.minLength(1),EmptySpaceValidator.noEmptySpaceAllowed]]
    });

    this.formularios.controls.push(this.formSaberesPrevios);

    this.formJustificacion = this._formBuilder.group({
      justificacion: ['', [Validators.required, Validators.maxLength(MAX_CARACTERES_JUSTIFICACION), EmptySpaceValidator.noEmptySpaceAllowed]]
    });

    this.formularios.controls.push(this.formJustificacion);

    this.formObjetivos = this._formBuilder.group({
      objetivoGeneral: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      objetivosEspecificos: this._formBuilder.array([

      ]),
    });

    this.formularios.controls.push(this.formObjetivos);

    this.formPFA = this._formBuilder.group({
      modo: [MODO_PFA_LISTADO],
      pfa: this._formBuilder.array([

      ], [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]),
      pfa_matriz: [''],
    });
    this.setPFAValidators(MODO_PFA_LISTADO);

    this.formularios.controls.push(this.formPFA);

    this.formContenidosTematicos = this._formBuilder.group({
      modo: ['texto'],
      descripcion: [''],
      imagen_id: [''],
    });
    this.setContenidoValidators('texto');

    this.formularios.controls.push(this.formContenidosTematicos);

    this.formMedios = this._formBuilder.group({
      medios: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formMedios);

    this.formPracticasAcademicas = this._formBuilder.group({
      practicasAcademicas: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
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

    // El acta y el documento de soporte solo son obligatorios para la
    // publicación de un syllabus: no aplican en el flujo ni en las propuestas.
    const exigeSeguimiento = !this.flujoMode && !this.modoPropuesta;

    this.formSeguimiento = this._formBuilder.group({
      numeroActa: [!this.isNew && this.Syllabus.seguimiento ? this.Syllabus.seguimiento.numeroActa : '', exigeSeguimiento ? [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed] : []],
      archivo: ['', exigeSeguimiento ? [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed] : []] // loaded in handleFileInputActaChange()
    })

    this.formularios.controls.push(this.formSeguimiento);

    this.formIdiomas = this._formBuilder.group({
      idioma_espacio_id: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formIdiomas);

    this.cargarContenido(!this.isNew && this.Syllabus ? this.Syllabus : {});

    if (this.isNew) {
      this.agregarObjetivoEspecifico();
      this.agregarPFA(undefined, false);
      this.agregarBibliografiaBasica(undefined, false);
      this.agregarBibliografiaComplementaria(undefined, false);
      this.agregarBibliografiaBase(undefined, false);
      this.agregarBibliografiaPaginaWeb(undefined, false);
    } else {
      this.formIdiomas.get('idioma_espacio_id')?.setValue(this.Syllabus.idioma_espacio_id);

      if (this.Syllabus.seguimiento && this.Syllabus.seguimiento.archivo) {
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

  /**
   * Carga en los formularios el contenido reutilizable del syllabus.
   * No modifica identificación, idiomas, evaluación ni seguimiento.
   */
  private cargarContenido(syllabus: Partial<Syllabus>): void {
    this.formSaberesPrevios.get('saberesPrevios')?.setValue(syllabus.sugerencias ?? '');
    this.formJustificacion.get('justificacion')?.setValue(syllabus.justificacion ?? '');
    this.formObjetivos.get('objetivoGeneral')?.setValue(syllabus.objetivo_general ?? '');

    this.objetivosEspecificos.clear();
    (syllabus.objetivos_especificos ?? []).forEach((objetivo) => {
      this.agregarObjetivoEspecifico(objetivo, true);
    });

    const resultados = Array.isArray(syllabus.resultados_aprendizaje)
      ? syllabus.resultados_aprendizaje
      : [];
    const primerPFA = resultados.length > 0 ? resultados[0] : undefined;
    const esMatrizPFA = !!primerPFA && primerPFA.pfa_matriz !== undefined && primerPFA.pfa_matriz !== null;
    const modoPFA: PFAModo = esMatrizPFA ? MODO_PFA_MATRIZ : MODO_PFA_LISTADO;

    this.modoPFA = modoPFA;
    this.pfa.clear();
    this.formPFA.get('modo')?.setValue(modoPFA);
    this.formPFA.get('pfa_matriz')?.setValue(esMatrizPFA ? (primerPFA?.pfa_matriz ?? '') : '');
    if (!esMatrizPFA) {
      resultados.forEach((pfa) => this.agregarPFA(pfa, true));
    }
    this.setPFAValidators(modoPFA);
    this.updateViewTablePFA();

    const contenido = syllabus.contenido;
    const modoContenido: 'texto' | 'imagen' = contenido?.imagen_id ? 'imagen' : 'texto';
    this.formContenidosTematicos.get('modo')?.setValue(modoContenido);
    this.formContenidosTematicos.get('descripcion')?.setValue(contenido?.descripcion ?? '');
    this.formContenidosTematicos.get('imagen_id')?.setValue(contenido?.imagen_id ?? '');
    this.setContenidoValidators(modoContenido);

    this.formMedios.get('medios')?.setValue(syllabus.recursos_educativos ?? '');
    this.formPracticasAcademicas.get('practicasAcademicas')?.setValue(syllabus.practicas_academicas ?? '');

    this.basicas.clear();
    this.complementarias.clear();
    this.bases.clear();
    this.paginasWeb.clear();

    (syllabus.bibliografia?.basicas ?? []).forEach((item) => this.agregarBibliografiaBasica(item, true));
    (syllabus.bibliografia?.complementarias ?? []).forEach((item) => this.agregarBibliografiaComplementaria(item, true));
    (syllabus.bibliografia?.bases ?? []).forEach((item) => this.agregarBibliografiaBase(item, true));
    (syllabus.bibliografia?.paginasWeb ?? []).forEach((item) => this.agregarBibliografiaPaginaWeb(item, true));

    this.updateViewTableBiblioBas();
    this.updateViewTableBiblioCom();
    this.updateViewTableBiblioBases();
    this.updateViewTableBiblioPag();
  }

  setContenidoValidators(modo: string): void {
    if (!this.formContenidosTematicos) {
      return;
    }

    const descripcion = this.formContenidosTematicos.get('descripcion');
    const imagen = this.formContenidosTematicos.get('imagen_id');

    if (modo === 'imagen') {
      descripcion?.clearValidators();
      imagen?.setValidators([Validators.required]);
    } else {
      imagen?.clearValidators();
      descripcion?.setValidators([RichTextValidator.required]);
    }

    descripcion?.updateValueAndValidity();
    imagen?.updateValueAndValidity();
  }

  onModoContenidoChange(modo: string): void {
    this.setContenidoValidators(modo);
  }

  setPFAValidators(modo: string): void {
    if (!this.formPFA) {
      return;
    }

    const listado = this.formPFA.get('pfa');
    const matriz = this.formPFA.get('pfa_matriz');

    if (modo === MODO_PFA_MATRIZ) {
      listado?.clearValidators();
      matriz?.setValidators([PFAValidator.matrizValida]);
    } else {
      matriz?.clearValidators();
      listado?.setValidators([Validators.required, EmptySpaceValidator.noEmptySpaceAllowed]);
    }

    listado?.updateValueAndValidity();
    matriz?.updateValueAndValidity();
  }

  onModoPFAChange(modo: PFAModo): void {
    this.modoPFA = modo;
    // Los modos son excluyentes: al cambiar de modo se descarta el contenido
    // del modo anterior y el bloque queda en blanco.
    this.pfa.clear();
    this.formPFA.get('pfa_matriz')?.setValue('');
    if (modo === MODO_PFA_LISTADO) {
      this.agregarPFA(undefined, false);
    }
    this.updateViewTablePFA();
    this.setPFAValidators(modo);
  }

  importarDesdePropuesta(): void {
    const codigoProyecto = this.PlanEstudio?.pen_cra_cod;
    if (!codigoProyecto) {
      return;
    }

    const dialogRef = this.dialog.open(ImportarPropuestaComponent, {
      width: '720px',
      maxWidth: '94vw',
      panelClass: 'sga-modal-panel',
      data: { codigoProyecto },
    });

    dialogRef.afterClosed().subscribe((propuesta: Syllabus | undefined) => {
      if (!propuesta) {
        return;
      }

      const importar = () => {
        this.cargarContenido(extraerContenidoPropuesta(propuesta));
      };

      if (!this.tieneContenido()) {
        importar();
        return;
      }

      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('CREAR_SYLLABUS.importar_propuesta_confirmar_titulo'),
        text: this.translate.instant('CREAR_SYLLABUS.importar_propuesta_confirmar_texto'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('CREAR_SYLLABUS.importar_propuesta_confirmar'),
        cancelButtonText: this.translate.instant('CREAR_SYLLABUS.importar_propuesta_cancelar'),
      }).then((result: any) => {
        if (result.isConfirmed) {
          importar();
        }
      });
    });
  }

  private tieneContenido(): boolean {
    const tieneTexto = (valor: unknown): boolean =>
      typeof valor === 'string' ? !!valor.trim() : valor !== null && valor !== undefined;
    const texto = [
      this.formSaberesPrevios.get('saberesPrevios')?.value,
      this.formJustificacion.get('justificacion')?.value,
      this.formObjetivos.get('objetivoGeneral')?.value,
      this.formMedios.get('medios')?.value,
      this.formPracticasAcademicas.get('practicasAcademicas')?.value,
    ];
    const tieneTextoDirecto = texto.some(tieneTexto);
    const tieneImagen = tieneTexto(this.formContenidosTematicos.get('imagen_id')?.value);
    const tieneDescripcionTematica = !!htmlToText(
      this.formContenidosTematicos.get('descripcion')?.value ?? ''
    );
    const tieneObjetivos = this.objetivosEspecificos.controls.some((control) =>
      tieneTexto(control.get('objetivo')?.value)
    );
    const tienePFA = this.modoPFA === MODO_PFA_MATRIZ
      ? !!htmlToText(this.formPFA.get('pfa_matriz')?.value ?? '')
      : this.pfa.controls.some((control) => tieneTexto(control.get('pfa_programa')?.value));
    const tieneBibliografia = [
      ...this.basicas.controls,
      ...this.complementarias.controls,
      ...this.bases.controls,
      ...this.paginasWeb.controls,
    ].some((control) => tieneTexto(control.value));

    return tieneTextoDirecto || tieneImagen || tieneDescripcionTematica ||
      tieneObjetivos || tienePFA || tieneBibliografia;
  }

  validateForms(skipSeguimiento: boolean = false) {
    let isValid:Boolean=true;
    this.formularios.controls.forEach(element => {
      if (skipSeguimiento && element === this.formSeguimiento) {
        return;
      }
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

  agregarObjetivoEspecifico(obj?: ObjetivoEspecifico, permitirExceder = false) {
    if (!permitirExceder && this.objetivosEspecificos.length >= MAX_OBJETIVOS_ESPECIFICOS) {
      return;
    }
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

  private buildPFAPayload(): PFA[] {
    const modo = this.formPFA.get('modo')?.value;

    if (modo === MODO_PFA_MATRIZ) {
      const matriz = this.formPFA.get('pfa_matriz')?.value ?? '';
      return [{ pfa_matriz: sanitizeRichText(matriz) }];
    }

    return this.pfa.value as PFA[];
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

    if (this.modoPropuesta) {
      // La propuesta se registra sin espacio académico asociado y sin publicar,
      // con los datos de identificación capturados por el coordinador.
      aplicarDatosPropuesta(syllabus, {
        nombre: this.formPropuesta.get('propuesta_nombre')?.value ?? '',
        creditos: this.formPropuesta.get('propuesta_creditos')?.value ?? null,
      });
    } else {
      syllabus.espacio_academico_id = Number(this.EspacioAcademico.asi_cod);
    }
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
    syllabus.resultados_aprendizaje = this.buildPFAPayload();
    const modoContenido = this.formContenidosTematicos.get('modo')?.value;
    syllabus.contenido = modoContenido === 'imagen'
      ? { imagen_id: this.formContenidosTematicos.get('imagen_id')?.value }
      : { descripcion: normalizeRichTextValue(this.formContenidosTematicos.get('descripcion')?.value) };
    syllabus.evaluacion = this.buildEvaluacion();
    syllabus.recursos_educativos = this.formMedios.get('medios')?.value;
    syllabus.practicas_academicas = this.formPracticasAcademicas.get('practicasAcademicas')?.value;
    syllabus.bibliografia = this.formBibliografia.value;

    const nombre = this.userService.getNombreCompleto();
    const fechaEdicion = new Date().toISOString();
    const seguimientoPrevio = (this.Syllabus?.seguimiento || {}) as any;

    if (this.flujoMode) {
      // En el flujo (borrador/propuesta) solo se actualiza la elaboración.
      // La revisión (fecha) se registra al proponer y la aprobación (fecha y
      // revisor) al publicar; aquí se preservan si ya existieran.
      syllabus.seguimiento = {
        ...seguimientoPrevio,
        elaboro: nombre,
        fecha_elaboro: fechaEdicion,
        numeroActa: seguimientoPrevio.numeroActa ?? '',
        archivo: seguimientoPrevio.archivo ?? null,
      };
    } else if (this.modoPropuesta) {
      // La propuesta todavía no ha sido revisada ni aprobada: se registra solo
      // quién la elaboró, con la misma estructura del bloque de seguimiento del
      // flujo. El acta se adjunta al publicar el syllabus.
      syllabus.seguimiento = {
        ...seguimientoPrevio,
        elaboro: nombre,
        fecha_elaboro: fechaEdicion,
        numeroActa: seguimientoPrevio.numeroActa ?? '',
        archivo: seguimientoPrevio.archivo ?? null,
      };
    } else {
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
    }

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
            // El id se toma antes de armar el payload, que lo elimina.
            const idDocumento = this.Syllabus?._id;
            const syllabus = this.buildSyllabusPayload(respuesta?.res?.Enlace);

            if (debeActualizarEnSitio(this.modoPropuesta, this.isNew, idDocumento)) {
              this.actualizarPropuesta(syllabus, idDocumento);
            } else {
              this.crearVersionSyllabus(syllabus);
            }
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

  /**
   * Actualiza en sitio la propuesta: es un documento en elaboración y no genera
   * una versión nueva del syllabus.
   */
  private actualizarPropuesta(syllabus: any, idDocumento: string): void {
    this.request.put(environment.SYLLABUS_CRUD, 'syllabus', syllabus, idDocumento).subscribe({
      next: () => {
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'Propuesta actualizada',
        })
        this.router.navigate(['/buscar_syllabus'], { skipLocationChange: true });
      },
      error: () => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Fallo la actualización de la propuesta',
        })
      }
    })
  }

  /**
   * Crea una versión nueva del syllabus. Es el comportamiento de los syllabus
   * oficiales, que se versionan en cada edición.
   */
  private crearVersionSyllabus(syllabus: any): void {
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
  }

  SubmitSyllabus() {
    // En modo propuesta el acta y el documento de soporte no se exigen.
    if (this.validateForms(this.modoPropuesta)) {
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
    if (this.modoPropuesta) {
      // La propuesta no se publica: no hay acta ni documento de soporte.
      const doc: any = { res: { Enlace: '' } };
      return of(doc);
    }
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
    // El modo flujo (borrador/propuesta) solo se alcanza desde "Mis syllabus asignados";
    // sin flujo se llega desde la vista de búsqueda de syllabus.
    const destino = this.flujoMode ? '/mis-asignaciones' : '/buscar_syllabus';
    this.router.navigate([destino], { skipLocationChange: true });
  }

  guardarBorradorFlujo(proponer: boolean) {
    if (!this.flujoCode) {
      return;
    }
    if (proponer && !this.validateForms(true)) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        html: `Por favor llene los campos requeridos`
      });
      return;
    }
    const payload = this.buildSyllabusPayload(this.actaPrevia.uid || '');
    payload.documento = this.flujoService.getDocumento();
    Swal.fire({
      title: proponer ? 'Enviando a revisión' : 'Guardando borrador',
      html: `Por favor espere`,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => { Swal.showLoading(); },
    });
    this.flujoService.guardarBorrador(this.flujoCode, payload).subscribe({
      next: () => {
        if (!proponer) {
          Swal.close();
          Swal.fire({ icon: 'success', title: 'Borrador guardado' });
          return;
        }
        this.flujoService.proponer(this.flujoCode, {
          documento: this.flujoService.getDocumento(),
          observacion: '',
        }).subscribe({
          next: () => {
            Swal.close();
            Swal.fire({ icon: 'success', title: 'Propuesta enviada a revisión' });
            this.syllabusService.setFlujoDraft(null);
            this.router.navigate(['/dashboard'], { skipLocationChange: true });
          },
          error: (err) => {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'No se pudo enviar a revisión',
              text: err?.error?.Message || 'Intente nuevamente.',
            });
          },
        });
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'No se pudo guardar el borrador',
          text: err?.error?.Message || 'Intente nuevamente.',
        });
      },
    });
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
    return fechaCorta(date);
  }

  fechaActual(): string {
    return moment().format('YYYY-MM-DD');
  }

  fechaRevisionConsejo(): string {
    return fechaCorta(this.Syllabus?.seguimiento?.fechaRevisionConsejo);
  }

  fechaAprobacionConsejo(): string {
    return fechaCorta(this.Syllabus?.seguimiento?.fechaAprobacionConsejo);
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
