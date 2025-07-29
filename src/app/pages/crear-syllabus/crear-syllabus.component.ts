import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms'
import { SyllabusService } from '../services/syllabus.service';
import { ProyectoAcademico } from 'src/app/@core/models/proyectoAcademico';
import { PlanEstudio } from 'src/app/@core/models/planEstudio';
import { EspacioAcademico } from 'src/app/@core/models/espacioAcademico';
import { Router } from '@angular/router';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TipoEvaluacion, Syllabus, Tema, PFA, ObjetivoEspecifico } from 'src/app/@core/models/syllabus';
import { GestorDocumentalService } from '../services/gestor_documental.service';
import { Documento } from 'src/app/@core/models/documento';
import  {EmptySpaceValidator } from '../../@core/validators/emptyValue.validator'
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';

@Component({
  selector: 'app-crear-syllabus',
  templateUrl: './crear-syllabus.component.html',
  styleUrls: ['./crear-syllabus.component.scss']
})
export class CrearSyllabusComponent implements OnInit, OnDestroy {
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
  actaPrevia: { uid: string | null, url: string | null } = { uid: null, url: null };
  private resultadoSubscriptions: any[] = [];

  formularios: FormArray = this._formBuilder.array([]);

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

  resultados(i: number): FormArray {
    return (this.pfa.at(i) as FormGroup).get('resultados') as FormArray;
  }

  get temas() {
    return this.formContenidosTematicos.get('temas') as FormArray;
  }

  subtemas(indexTema: number): FormArray {
    return this.temas.at(indexTema).get('subtemas') as FormArray;
  }

  get estrategias() {
    return this.formEstrategias.get('estrategias') as FormGroup;
  }

  get tiposEvaluacion() {
    return this.formEvaluacion.get('tipos_evaluacion') as FormArray;
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

  resultadosAprendizajeDisponibles: {id: string, resultado_detallado: string}[] = [];

  updateResultadosAprendizajeDisponibles() {
    const resultados: {id: string, resultado_detallado: string}[] = [];
    this.pfa.controls.forEach((comp: AbstractControl) => {
      const resArr = (comp.get('resultados') as FormArray).controls;
      resArr.forEach((resCtrl: AbstractControl) => {
        const id = resCtrl.get('id')?.value;
        const resultado_detallado = resCtrl.get('resultado_detallado')?.value;
        // Solo agregar si ambos valores están presentes
        if (id && resultado_detallado) {
          resultados.push({
            id: id,
            resultado_detallado: resultado_detallado
          });
        }
      });
    });
    // Filtrar duplicados por id
    this.resultadosAprendizajeDisponibles = resultados.filter((ra, idx, arr) => arr.findIndex(r => r.id === ra.id) === idx);
    
    // Actualizar los tipos de evaluación existentes con los nuevos resultados disponibles
    this.updateTiposEvaluacionConNuevosResultados();
  }

  updateTiposEvaluacionConNuevosResultados() {
    this.tiposEvaluacion.controls.forEach((tipoEvaluacionCtrl: AbstractControl) => {
      const raGroup = tipoEvaluacionCtrl.get('resultados_aprendizaje_asociados') as FormGroup;
      if (raGroup) {
        // Obtener los valores actuales seleccionados
        const valoresActuales = Object.keys(raGroup.controls).filter(id => raGroup.get(id)?.value);
        
        // Crear un nuevo FormGroup con todos los resultados disponibles
        const nuevoRaGroup: {[key: string]: FormControl} = {};
        this.resultadosAprendizajeDisponibles.forEach(ra => {
          nuevoRaGroup[ra.id] = this._formBuilder.control(valoresActuales.includes(ra.id));
        });
        
        // Reemplazar el FormGroup existente
        (tipoEvaluacionCtrl as FormGroup).setControl('resultados_aprendizaje_asociados', this._formBuilder.group(nuevoRaGroup));
      }
    });
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
    if (Object.keys(this.Proyecto).length === 0 || Object.keys(this.PlanEstudio).length === 0 || Object.keys(this.EspacioAcademico).length === 0) {
      this.router.navigate(['/buscar_syllabus'],{ skipLocationChange: true })
    } else {
      this.loadInfoIdentificacionEspacioAcademico();
      this.loadIdiomas();
      this.initForms();
      this.updateResultadosAprendizajeDisponibles();
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
      pfa: this._formBuilder.array([], [Validators.required, EmptySpaceValidator.noEmptySpaceAllowed])
    });
    this.formularios.controls.push(this.formPFA);

    this.formContenidosTematicos = this._formBuilder.group({
      descripcion: [this.Syllabus.contenido && !this.isNew ? this.Syllabus.contenido.descripcion : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      temas: this._formBuilder.array([

      ])
    });

    this.formularios.controls.push(this.formContenidosTematicos);


    this.formEstrategias = this._formBuilder.group({
      estrategias: this._formBuilder.group({
        tradicional: [this.Syllabus.estrategias?.tradicional ?? false],
        basado_problemas: [this.Syllabus.estrategias?.basado_problemas ?? false],
        aprendizaje_activo: [this.Syllabus.estrategias?.aprendizaje_activo ?? false],
        basado_proyectos: [this.Syllabus.estrategias?.basado_proyectos ?? false],
        colaborativo: [this.Syllabus.estrategias?.colaborativo ?? false],
        autodirigido: [this.Syllabus.estrategias?.autodirigido ?? false],
        basado_tecnologia: [this.Syllabus.estrategias?.basado_tecnologia ?? false],
        basado_experiencias: [this.Syllabus.estrategias?.basado_experiencias ?? false],
        centrado_estudiante: [this.Syllabus.estrategias?.centrado_estudiante ?? false],
      })
    });
    this.formularios.controls.push(this.formEstrategias);

    this.formEvaluacion = this._formBuilder.group({
      tipos_evaluacion: this._formBuilder.array([])
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

      basicas: this._formBuilder.array([]),
      complementarias: this._formBuilder.array([]),
      paginasWeb: this._formBuilder.array([])
    })

    this.formularios.controls.push(this.formBibliografia);

    this.formSeguimiento = this._formBuilder.group({
      fechaRevisionConsejo: [!this.isNew ? this.Syllabus.seguimiento.fechaRevisionConsejo : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      fechaAprobacionConsejo: [!this.isNew ? this.Syllabus.seguimiento.fechaAprobacionConsejo : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      numeroActa: [!this.isNew ? this.Syllabus.seguimiento.numeroActa : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      archivo: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formSeguimiento);

    this.formVigencia = this._formBuilder.group({
      fechaInicio: [!this.isNew ? this.Syllabus.vigencia.fechaInicio : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      fechaFin: [!this.isNew ? this.Syllabus.vigencia.fechaFin : '']
    })

    this.formularios.controls.push(this.formVigencia);

    this.formIdiomas = this._formBuilder.group({
      idioma_espacio_id: ['', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]]
    })

    this.formularios.controls.push(this.formIdiomas);

    if (this.isNew) {
      this.agregarCompetencia();
      this.agregarTema();
      this.agregarTipoEvaluacion(undefined);
      this.agregarBibliografiaBasica(undefined, false);
      this.agregarBibliografiaComplementaria(undefined, false);
      this.agregarBibliografiaPaginaWeb(undefined, false);
    } else {
      this.formIdiomas.get('idioma_espacio_id')?.setValue(this.Syllabus.idioma_espacio_id);

      this.Syllabus.objetivos_especificos?.forEach((obj_esp) => {
        this.agregarObjetivoEspecifico(obj_esp);
      })
      this.Syllabus.resultados_aprendizaje?.forEach((pfa, idx) => {
        this.agregarCompetencia(pfa, true);
      });
      this.Syllabus.contenido?.temas?.forEach((tema) => {
        this.agregarTema(tema);
      })
      this.Syllabus.estrategias = this.formEstrategias.get('estrategias')?.value;
      this.Syllabus.evaluacion?.tipos_evaluacion?.forEach((tipoEvaluacion) => {
        this.agregarTipoEvaluacion(tipoEvaluacion);
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
      
      // Actualizar resultados disponibles después de cargar todos los datos
      setTimeout(() => {
        this.updateResultadosAprendizajeDisponibles();
      }, 100);
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

  agregarCompetencia(data?: any, noUpdate?: boolean) {
    const competenciaGroup = this._formBuilder.group({
      competencia: [data?.competencia || '', [Validators.required, EmptySpaceValidator.noEmptySpaceAllowed]],
      resultados: this._formBuilder.array([])
    });
    this.pfa.push(competenciaGroup);
    if (data?.resultados) {
      data.resultados.forEach((res: any) => {
        this.agregarResultado(this.pfa.length - 1, res, true);
      });
    } else {
      this.agregarResultado(this.pfa.length - 1, undefined, true);
    }
    this.reasignarIdsResultados();
    // Usar setTimeout para asegurar que los controles estén completamente inicializados
    setTimeout(() => {
      this.updateResultadosAprendizajeDisponibles();
    }, 0);
  }

  eliminarCompetencia(index: number) {
    this.pfa.removeAt(index);
    this.reasignarIdsResultados();
    // Usar setTimeout para asegurar que los controles estén completamente inicializados
    setTimeout(() => {
      this.updateResultadosAprendizajeDisponibles();
    }, 0);
  }

  agregarResultado(idxCompetencia: number, data?: any, skipReasignar?: boolean) {
    const resultadoGroup = this._formBuilder.group({
      id: [{ value: data?.id || '', disabled: true }],
      dominio: [data?.dominio || '', [Validators.required, EmptySpaceValidator.noEmptySpaceAllowed]],
      resultado_detallado: [data?.resultado_detallado || '', [Validators.required, EmptySpaceValidator.noEmptySpaceAllowed]]
    });
    
    // Agregar listener para cambios en resultado_detallado
    const subscription = resultadoGroup.get('resultado_detallado')?.valueChanges.subscribe(() => {
      setTimeout(() => {
        this.updateResultadosAprendizajeDisponibles();
      }, 100);
    });
    
    if (subscription) {
      this.resultadoSubscriptions.push(subscription);
    }
    
    this.resultados(idxCompetencia).push(resultadoGroup);
    if (!skipReasignar) this.reasignarIdsResultados();
    // Usar setTimeout para asegurar que los controles estén completamente inicializados
    setTimeout(() => {
      this.updateResultadosAprendizajeDisponibles();
    }, 0);
  }

  eliminarResultado(idxCompetencia: number, idxResultado: number) {
    this.resultados(idxCompetencia).removeAt(idxResultado);
    this.reasignarIdsResultados();
    // Usar setTimeout para asegurar que los controles estén completamente inicializados
    setTimeout(() => {
      this.updateResultadosAprendizajeDisponibles();
    }, 0);
  }

  reasignarIdsResultados() {
    let id = 1;
    for (let i = 0; i < this.pfa.length; i++) {
      const resultadosArr = this.resultados(i);
      for (let j = 0; j < resultadosArr.length; j++) {
        const idValue = id.toString().padStart(2, '0');
        resultadosArr.at(j).get('id')?.setValue(idValue);
        id++;
      }
    }
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

  // Cambia agregarTipoEvaluacion para inicializar resultados_aprendizaje_asociados como un FormGroup de checkboxes
  agregarTipoEvaluacion(d?: TipoEvaluacion) {
    const raGroup: {[key: string]: FormControl} = {};
    this.resultadosAprendizajeDisponibles.forEach(ra => {
      raGroup[ra.id] = this._formBuilder.control(d ? (d.resultados_aprendizaje_asociados?.includes(ra.id) ?? false) : false);
    });
    const formTipoEvaluacion = this._formBuilder.group({
      nombre: [d ? d.nombre : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      tipo_evaluacion: [d ? d.tipo_evaluacion : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      porcentaje: [d ? d.porcentaje : 0, [Validators.required, Validators.min(0), Validators.max(100),EmptySpaceValidator.noEmptySpaceAllowed]],
      trabajo_tipo: [d ? d.trabajo_tipo : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      tipo_nota: [d ? d.tipo_nota : '', [Validators.required,EmptySpaceValidator.noEmptySpaceAllowed]],
      resultados_aprendizaje_asociados: this._formBuilder.group(raGroup)
    });
    this.tiposEvaluacion.push(formTipoEvaluacion);
  }

  eliminarTipoEvaluacion(index: number) {
    this.tiposEvaluacion.removeAt(index);
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
    this.dataSourceFormBiblioBas.next(this.basicas.controls);
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
  }

  createNewVersionSyllabus(){
    const syllabus: Syllabus = new Syllabus();

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
        let pen_cra_cod = Number(this.PlanEstudio.pen_cra_cod);
        let pen_nro = Number(this.PlanEstudio.pen_nro);

        syllabus.espacio_academico_id = Number(this.EspacioAcademico.asi_cod);
        syllabus.tercero_id = Number(localStorage.getItem('persona_id'));
        if(this.Syllabus.syllabus_code && !this.isNew){
          syllabus.syllabus_code=this.Syllabus.syllabus_code;
        }

        if(this.Syllabus.proyecto_curricular_ids == undefined || this.Syllabus.proyecto_curricular_ids.length == 0){
          syllabus.proyecto_curricular_ids = [pen_cra_cod];
        } else if(this.Syllabus.proyecto_curricular_ids.includes(pen_cra_cod)){
          syllabus.proyecto_curricular_ids = this.Syllabus.proyecto_curricular_ids;
        }else{
          syllabus.proyecto_curricular_ids = this.Syllabus.proyecto_curricular_ids;
          syllabus.proyecto_curricular_ids.push(pen_cra_cod);
        }

        if(this.Syllabus.plan_estudios_ids == undefined || this.Syllabus.plan_estudios_ids.length == 0){
          syllabus.plan_estudios_ids = [pen_nro];
        } else if(this.Syllabus.plan_estudios_ids.includes(pen_nro)){
          syllabus.plan_estudios_ids = this.Syllabus.plan_estudios_ids;
        }else{
          syllabus.plan_estudios_ids = this.Syllabus.plan_estudios_ids;
          syllabus.plan_estudios_ids.push(pen_nro);
        }

        syllabus.idioma_espacio_id = this.formIdiomas.get('idioma_espacio_id')?.value;
        syllabus.sugerencias = this.formSaberesPrevios.get('saberesPrevios')?.value;
        syllabus.justificacion = this.formJustificacion.get('justificacion')?.value;
        syllabus.objetivo_general = this.formObjetivos.get('objetivoGeneral')?.value;
        syllabus.objetivos_especificos = this.objetivosEspecificos.value;
        syllabus.resultados_aprendizaje = this.pfa.getRawValue().map((comp: any, idx: number) => ({
          competencia: comp.competencia,
          resultados: comp.resultados.map((res: any) => ({
            id: res.id || '',
            dominio: res.dominio,
            resultado_detallado: res.resultado_detallado
          }))
        }));
        syllabus.contenido = this.formContenidosTematicos.value;
        syllabus.estrategias = this.formEstrategias.get('estrategias')?.value;
        // Transformar resultados_aprendizaje_asociados de FormGroup a array
        const evaluacionData = this.formEvaluacion.value;
        evaluacionData.tipos_evaluacion = evaluacionData.tipos_evaluacion.map((tipoEvaluacion: any) => {
          if (tipoEvaluacion.resultados_aprendizaje_asociados && typeof tipoEvaluacion.resultados_aprendizaje_asociados === 'object') {
            const seleccionados = Object.keys(tipoEvaluacion.resultados_aprendizaje_asociados)
              .filter(id => tipoEvaluacion.resultados_aprendizaje_asociados[id]);
            return {
              ...tipoEvaluacion,
              resultados_aprendizaje_asociados: seleccionados
            };
          }
          return tipoEvaluacion;
        });
        syllabus.evaluacion = evaluacionData;
        syllabus.recursos_educativos = this.formMedios.get('medios')?.value;
        syllabus.practicas_academicas = this.formPracticasAcademicas.get('practicasAcademicas')?.value;
        syllabus.bibliografia = this.formBibliografia.value;
        syllabus.seguimiento = this.formSeguimiento.value;
        syllabus.seguimiento.archivo = respuesta.res.Enlace
        syllabus.vigencia = this.formVigencia.value;
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

  ngOnDestroy(): void {
    this.resultadoSubscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
