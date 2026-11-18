import { aplicarDatosPropuesta, esPropuestaSyllabus } from './propuesta.utils';

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
});
