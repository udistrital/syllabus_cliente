// Utilidades de la matriz de propósitos (modo matriz del bloque de PFA).
// La matriz es una tabla HTML con una fila de encabezado (la primera columna
// es fija: "Propósitos de Formación") y hasta N filas de contenido.

export const COLUMNAS_MINIMAS_MATRIZ = 2;

export function filasContenidoMatriz(tabla: HTMLTableElement | null): HTMLTableRowElement[] {
  const tbody = tabla?.querySelector('tbody');
  return tbody ? (Array.from(tbody.querySelectorAll('tr')) as HTMLTableRowElement[]) : [];
}

export function cantidadColumnasMatriz(tabla: HTMLTableElement | null): number {
  const encabezado = tabla?.querySelector('thead tr') as HTMLTableRowElement | null;
  return encabezado ? encabezado.cells.length : 0;
}

export function crearMatrizPorDefecto(editor: HTMLElement, encabezado: string): HTMLTableElement {
  editor.innerHTML = '';

  const tabla = document.createElement('table');
  const thead = document.createElement('thead');
  const filaEncabezado = document.createElement('tr');

  const thFijo = document.createElement('th');
  thFijo.textContent = encabezado;
  thFijo.setAttribute('contenteditable', 'false');
  filaEncabezado.appendChild(thFijo);

  const thEditable = document.createElement('th');
  thEditable.appendChild(document.createElement('br'));
  filaEncabezado.appendChild(thEditable);

  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement('tbody');
  const fila = document.createElement('tr');
  for (let i = 0; i < COLUMNAS_MINIMAS_MATRIZ; i++) {
    const celda = document.createElement('td');
    celda.appendChild(document.createElement('br'));
    fila.appendChild(celda);
  }
  tbody.appendChild(fila);
  tabla.appendChild(tbody);

  editor.appendChild(tabla);
  return tabla;
}

// Deja la tabla con la estructura esperada: una fila de encabezado, la columna
// fija de propósitos y hasta maxFilas filas de contenido. El contenido que se
// escriba fuera de la tabla se descarta.
export function normalizarMatriz(editor: HTMLElement, encabezado: string, maxFilas: number): void {
  const tabla = editor.querySelector('table');

  if (!tabla) {
    crearMatrizPorDefecto(editor, encabezado);
    return;
  }

  // Solo se conserva la tabla: el contenido enriquecido vive dentro de ella.
  Array.from(editor.childNodes).forEach((nodo) => {
    if (nodo === tabla) {
      return;
    }
    if (nodo.nodeType === Node.TEXT_NODE && !(nodo.textContent || '').trim()) {
      return;
    }
    nodo.parentNode?.removeChild(nodo);
  });

  let thead = tabla.querySelector('thead');
  let tbody = tabla.querySelector('tbody');

  if (!tbody) {
    tbody = document.createElement('tbody');
    tabla.appendChild(tbody);
  }

  if (!thead) {
    thead = document.createElement('thead');
    tabla.insertBefore(thead, tabla.firstChild);
  }

  const cuerpo: HTMLTableSectionElement = tbody;

  // Una única fila de encabezado.
  const filasEncabezado = Array.from(thead.querySelectorAll('tr')) as HTMLTableRowElement[];
  filasEncabezado.slice(1).forEach((fila) => fila.parentElement?.removeChild(fila));
  const filaEncabezado: HTMLTableRowElement = filasEncabezado[0] ?? document.createElement('tr');

  if (!filaEncabezado.parentElement) {
    thead.appendChild(filaEncabezado);
  }

  // La columna fija de propósitos y al menos una columna editable.
  while (filaEncabezado.cells.length < COLUMNAS_MINIMAS_MATRIZ) {
    const th = document.createElement('th');
    th.appendChild(document.createElement('br'));
    filaEncabezado.appendChild(th);
  }

  Array.from(filaEncabezado.cells).forEach((celda, indice) => {
    if (celda.tagName !== 'TH') {
      const th = document.createElement('th');
      th.innerHTML = celda.innerHTML;
      celda.parentElement?.replaceChild(th, celda);
      return;
    }
    if (indice === 0) {
      // La primera columna es fija: no se puede renombrar ni editar.
      celda.textContent = encabezado;
      celda.setAttribute('contenteditable', 'false');
    } else {
      celda.removeAttribute('contenteditable');
    }
  });

  // Las filas sueltas pasan al cuerpo de la tabla.
  Array.from(tabla.rows).forEach((fila) => {
    if (fila.parentElement !== thead && fila.parentElement !== cuerpo) {
      cuerpo.appendChild(fila);
    }
  });

  // Máximo de filas de propósito.
  filasContenidoMatriz(tabla).slice(maxFilas).forEach((fila) => {
    fila.parentElement?.removeChild(fila);
  });

  const columnas = filaEncabezado.cells.length;
  filasContenidoMatriz(tabla).forEach((fila) => {
    while (fila.cells.length < columnas) {
      const td = document.createElement('td');
      td.appendChild(document.createElement('br'));
      fila.appendChild(td);
    }
    while (fila.cells.length > columnas) {
      fila.deleteCell(fila.cells.length - 1);
    }
    const primera = fila.cells.item(0);
    if (primera && primera.tagName !== 'TD') {
      const td = document.createElement('td');
      td.innerHTML = primera.innerHTML;
      primera.parentElement?.replaceChild(td, primera);
    }
    fila.cells.item(0)?.removeAttribute('contenteditable');
  });
}

// Agrega una fila de propósito al final del cuerpo de la tabla.
export function agregarFilaMatriz(tabla: HTMLTableElement | null, maxFilas: number): HTMLTableRowElement | null {
  const tbody = tabla?.querySelector('tbody');

  if (!tabla || !tbody) {
    return null;
  }

  if (filasContenidoMatriz(tabla).length >= maxFilas) {
    return null;
  }

  const columnas = cantidadColumnasMatriz(tabla) || COLUMNAS_MINIMAS_MATRIZ;
  const fila = document.createElement('tr');

  for (let i = 0; i < columnas; i++) {
    const celda = document.createElement('td');
    celda.appendChild(document.createElement('br'));
    fila.appendChild(celda);
  }

  tbody.appendChild(fila);
  return fila;
}

// Elimina una fila de propósito. La fila de encabezado no se puede eliminar y
// siempre debe quedar al menos una fila de contenido.
export function eliminarFilaMatriz(
  tabla: HTMLTableElement | null,
  fila: HTMLTableRowElement | null
): HTMLTableRowElement | null {
  const tbody = tabla?.querySelector('tbody');

  if (!tabla || !tbody || !fila || fila.parentElement !== tbody) {
    return null;
  }

  const filas = filasContenidoMatriz(tabla);
  if (filas.length <= 1) {
    return null;
  }

  const indice = filas.indexOf(fila);
  fila.parentElement?.removeChild(fila);

  return filas[indice + 1] ?? filas[indice - 1] ?? null;
}

// Agrega una columna editable al final de la matriz.
export function agregarColumnaMatriz(tabla: HTMLTableElement | null, maxColumnas: number): boolean {
  const encabezado = tabla?.querySelector('thead tr') as HTMLTableRowElement | null;

  if (!tabla || !encabezado) {
    return false;
  }

  if (encabezado.cells.length >= maxColumnas) {
    return false;
  }

  Array.from(tabla.rows).forEach((fila, indice) => {
    const referencia = fila.cells.item(fila.cells.length - 1);
    const celda = document.createElement(indice === 0 ? 'th' : 'td');
    celda.appendChild(document.createElement('br'));
    fila.insertBefore(celda, referencia ? referencia.nextSibling : null);
  });

  return true;
}

// Elimina una columna editable. La columna de propósitos es obligatoria y
// siempre debe quedar al menos una columna editable.
export function eliminarColumnaMatriz(tabla: HTMLTableElement | null, indice: number): boolean {
  const encabezado = tabla?.querySelector('thead tr') as HTMLTableRowElement | null;

  if (!tabla || !encabezado) {
    return false;
  }

  if (indice === 0) {
    return false;
  }

  if (encabezado.cells.length <= COLUMNAS_MINIMAS_MATRIZ) {
    return false;
  }

  Array.from(tabla.rows).forEach((fila) => {
    const objetivo = fila.cells.item(indice);
    if (objetivo) {
      fila.removeChild(objetivo);
    }
  });

  return true;
}
