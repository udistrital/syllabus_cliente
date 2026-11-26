import {
  aplicarDatosPropuesta,
  debeActualizarEnSitio,
  esPropuestaSyllabus,
  extraerContenidoPropuesta
} from './propuesta.utils';

describe('propuesta.utils', () => {
  describe('esPropuestaSyllabus', () => {
    it('reconoce el documento marcado como propuesta', () => {
      expect(esPropuestaSyllabus({ es_propuesta: true })).toBe(true);
    });

    it('no reconoce los documentos normales', () => {
      expect(esPropuestaSyllabus({ es_propuesta: false })).toBe(false);
      expect(esPropuestaSyllabus({})).toBe(false);
      expect(esPropuestaSyllabus(null)).toBe(false);
      expect(esPropuestaSyllabus(undefined)).toBe(false);
    });
  });

  describe('aplicarDatosPropuesta', () => {
    it('deja la propuesta sin espacio académico y sin publicar', () => {
      const syllabus: any = { syllabus_code: 'abc', activo: true };

      aplicarDatosPropuesta(syllabus, { nombre: 'Cálculo Diferencial', creditos: 4 });

      expect(syllabus.espacio_academico_id).toBe(0);
      expect(syllabus.activo).toBe(false);
      expect(syllabus.es_propuesta).toBe(true);
      expect(syllabus.propuesta_nombre).toBe('Cálculo Diferencial');
      expect(syllabus.propuesta_creditos).toBe(4);
      // El resto del documento se conserva.
      expect(syllabus.syllabus_code).toBe('abc');
    });

    it('normaliza los datos vacíos', () => {
      const syllabus: any = {};

      aplicarDatosPropuesta(syllabus, { nombre: '', creditos: null });

      expect(syllabus.propuesta_nombre).toBe('');
      expect(syllabus.propuesta_creditos).toBeNull();
    });
  });

  describe('debeActualizarEnSitio', () => {
    it('actualiza en sitio una propuesta ya guardada', () => {
      expect(debeActualizarEnSitio(true, false, '6650f0a1b2c3d4e5f6071829')).toBe(true);
    });

    it('no cambia el versionado de los syllabus oficiales', () => {
      expect(debeActualizarEnSitio(false, false, '6650f0a1b2c3d4e5f6071829')).toBe(false);
    });

    it('crea la propuesta nueva con POST', () => {
      expect(debeActualizarEnSitio(true, true, undefined)).toBe(false);
      expect(debeActualizarEnSitio(true, false, undefined)).toBe(false);
    });
  });

  describe('extraerContenidoPropuesta', () => {
    it('extrae contenido, modo de PFA y bibliografía', () => {
      const propuesta: any = {
        sugerencias: 'Saberes previos',
        justificacion: 'Justificación',
        objetivo_general: 'Objetivo general',
        objetivos_especificos: [{ objetivo: 'Objetivo específico' }],
        resultados_aprendizaje: [{ pfa_matriz: '<table>...</table>' }],
        contenido: { descripcion: '<p>Temas</p>' },
        recursos_educativos: 'Recursos',
        practicas_academicas: 'Prácticas',
        bibliografia: {
          basicas: ['Básica'],
          complementarias: ['Complementaria'],
          bases: ['Base'],
          paginasWeb: ['Web'],
        },
        idioma_espacio_id: [1],
        evaluacion: { evaluaciones: [{ nombre: 'No importar' }] },
        seguimiento: { numeroActa: 'No importar' },
        propuesta_nombre: 'No importar',
        propuesta_creditos: 4,
        espacio_academico_id: 0,
      };

      const contenido = extraerContenidoPropuesta(propuesta);

      expect(contenido.sugerencias).toBe('Saberes previos');
      expect(contenido.resultados_aprendizaje).toEqual(propuesta.resultados_aprendizaje);
      expect(contenido.bibliografia).toEqual(propuesta.bibliografia);
      expect('idioma_espacio_id' in contenido).toBe(false);
      expect('evaluacion' in contenido).toBe(false);
      expect('seguimiento' in contenido).toBe(false);
      expect('propuesta_nombre' in contenido).toBe(false);
      expect('espacio_academico_id' in contenido).toBe(false);
    });
  });
});
