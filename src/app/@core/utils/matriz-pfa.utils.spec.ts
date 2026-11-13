import {
  agregarColumnaMatriz,
  agregarFilaMatriz,
  cantidadColumnasMatriz,
  crearMatrizPorDefecto,
  eliminarColumnaMatriz,
  eliminarFilaMatriz,
  filasContenidoMatriz,
  normalizarMatriz
} from './matriz-pfa.utils';

const ENCABEZADO = 'Propósitos de Formación';

function editor(): HTMLDivElement {
  return document.createElement('div');
}

function tablaDe(editor: HTMLElement): HTMLTableElement {
  return editor.querySelector('table') as HTMLTableElement;
}

describe('matriz-pfa.utils', () => {
  describe('crearMatrizPorDefecto', () => {
    it('crea encabezado fijo y una fila de propósito', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);

      expect(tabla.querySelectorAll('thead tr').length).toBe(1);
      expect(tabla.querySelectorAll('thead th').length).toBe(2);
      expect(tabla.querySelector('thead th')?.textContent).toBe(ENCABEZADO);
      expect(tabla.querySelector('thead th')?.getAttribute('contenteditable')).toBe('false');
      expect(filasContenidoMatriz(tabla).length).toBe(1);
      expect(filasContenidoMatriz(tabla)[0].cells.length).toBe(2);
    });
  });

  describe('normalizarMatriz', () => {
    it('crea la matriz cuando el editor está vacío', () => {
      const contenedor = editor();
      normalizarMatriz(contenedor, ENCABEZADO, 4);

      expect(tablaDe(contenedor)).toBeTruthy();
      expect(cantidadColumnasMatriz(tablaDe(contenedor))).toBe(2);
    });

    it('descarta el contenido escrito fuera de la tabla', () => {
      const contenedor = editor();
      crearMatrizPorDefecto(contenedor, ENCABEZADO);
      contenedor.insertBefore(document.createTextNode('texto suelto'), contenedor.firstChild);

      normalizarMatriz(contenedor, ENCABEZADO, 4);

      expect(contenedor.textContent).not.toContain('texto suelto');
      expect(contenedor.children.length).toBe(1);
    });

    it('deja la columna de propósitos fija e ineditable', () => {
      const contenedor = editor();
      crearMatrizPorDefecto(contenedor, ENCABEZADO);
      const th = tablaDe(contenedor).querySelector('thead th') as HTMLElement;
      th.textContent = 'Otro nombre';
      th.removeAttribute('contenteditable');

      normalizarMatriz(contenedor, ENCABEZADO, 4);

      const thNormalizado = tablaDe(contenedor).querySelector('thead th') as HTMLElement;
      expect(thNormalizado.textContent).toBe(ENCABEZADO);
      expect(thNormalizado.getAttribute('contenteditable')).toBe('false');
    });

    it('respeta el máximo de filas de propósito', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);
      for (let i = 0; i < 5; i++) {
        agregarFilaMatriz(tabla, 10);
      }

      normalizarMatriz(contenedor, ENCABEZADO, 4);

      expect(filasContenidoMatriz(tablaDe(contenedor)).length).toBe(4);
    });

    it('completa las celdas que faltan en las filas', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);
      agregarColumnaMatriz(tabla, 5);
      filasContenidoMatriz(tabla)[0].deleteCell(1);

      normalizarMatriz(contenedor, ENCABEZADO, 4);

      expect(filasContenidoMatriz(tablaDe(contenedor))[0].cells.length).toBe(3);
    });
  });

  describe('agregarFilaMatriz', () => {
    it('agrega filas hasta el máximo', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);

      expect(agregarFilaMatriz(tabla, 4)).toBeTruthy();
      expect(agregarFilaMatriz(tabla, 4)).toBeTruthy();
      expect(agregarFilaMatriz(tabla, 4)).toBeTruthy();
      expect(filasContenidoMatriz(tabla).length).toBe(4);
      expect(agregarFilaMatriz(tabla, 4)).toBeNull();
      expect(filasContenidoMatriz(tabla).length).toBe(4);
    });
  });

  describe('eliminarFilaMatriz', () => {
    it('no elimina la fila de encabezado', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);
      const encabezado = tabla.querySelector('thead tr') as HTMLTableRowElement;

      expect(eliminarFilaMatriz(tabla, encabezado)).toBeNull();
      expect(tabla.querySelectorAll('thead tr').length).toBe(1);
    });

    it('mantiene al menos una fila de propósito', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);
      const unica = filasContenidoMatriz(tabla)[0];

      expect(eliminarFilaMatriz(tabla, unica)).toBeNull();
      expect(filasContenidoMatriz(tabla).length).toBe(1);
    });

    it('elimina una fila de propósito', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);
      agregarFilaMatriz(tabla, 4);
      const filas = filasContenidoMatriz(tabla);

      eliminarFilaMatriz(tabla, filas[0]);

      expect(filasContenidoMatriz(tabla).length).toBe(1);
    });
  });

  describe('agregarColumnaMatriz', () => {
    it('agrega columnas hasta el máximo', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);

      expect(agregarColumnaMatriz(tabla, 3)).toBe(true);
      expect(cantidadColumnasMatriz(tabla)).toBe(3);
      expect(agregarColumnaMatriz(tabla, 3)).toBe(false);
      expect(cantidadColumnasMatriz(tabla)).toBe(3);
    });
  });

  describe('eliminarColumnaMatriz', () => {
    it('no elimina la columna de propósitos', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);
      agregarColumnaMatriz(tabla, 5);

      expect(eliminarColumnaMatriz(tabla, 0)).toBe(false);
      expect(cantidadColumnasMatriz(tabla)).toBe(3);
    });

    it('no elimina la última columna editable', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);

      expect(eliminarColumnaMatriz(tabla, 1)).toBe(false);
      expect(cantidadColumnasMatriz(tabla)).toBe(2);
    });

    it('elimina una columna editable', () => {
      const contenedor = editor();
      const tabla = crearMatrizPorDefecto(contenedor, ENCABEZADO);
      agregarColumnaMatriz(tabla, 5);

      expect(eliminarColumnaMatriz(tabla, 2)).toBe(true);
      expect(cantidadColumnasMatriz(tabla)).toBe(2);
      expect(filasContenidoMatriz(tabla)[0].cells.length).toBe(2);
    });
  });
});
