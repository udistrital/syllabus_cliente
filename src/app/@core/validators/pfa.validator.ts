import { AbstractControl, ValidationErrors } from '@angular/forms';
import { MAX_RICH_TEXT_LENGTH, htmlToText } from '../utils/html-editor.utils';

// Máximo de propósitos (filas de contenido) admitidos en la matriz de PFA.
export const MAX_FILAS_MATRIZ_PFA = 4;
// La matriz siempre tiene la columna fija de propósitos más al menos una editable.
export const COLUMNAS_MINIMAS_MATRIZ_PFA = 2;

export class PFAValidator {
  static matrizValida(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '') as string;

    if (value.length > MAX_RICH_TEXT_LENGTH) {
      return { maxRichTextLength: { max: MAX_RICH_TEXT_LENGTH, actual: value.length } };
    }

    if (!htmlToText(value)) {
      return { requiredRichText: true };
    }

    const doc = new DOMParser().parseFromString(value, 'text/html');
    const tabla = doc.body.querySelector('table');

    if (!tabla) {
      return { matrizInvalida: 'sin-tabla' };
    }

    const filasEncabezado = tabla.querySelectorAll('thead tr');
    if (filasEncabezado.length !== 1) {
      return { matrizInvalida: 'encabezado' };
    }

    const celdasEncabezado = filasEncabezado[0].querySelectorAll('th');
    if (celdasEncabezado.length < COLUMNAS_MINIMAS_MATRIZ_PFA) {
      return { matrizInvalida: 'columnas' };
    }

    const filas = tabla.querySelectorAll('tbody tr');
    if (filas.length < 1 || filas.length > MAX_FILAS_MATRIZ_PFA) {
      return { matrizInvalida: 'filas' };
    }

    for (const fila of Array.from(filas)) {
      const celdas = fila.querySelectorAll('td');
      if (celdas.length < COLUMNAS_MINIMAS_MATRIZ_PFA) {
        return { matrizInvalida: 'columnas' };
      }
      // La primera columna de cada fila corresponde al propósito y es obligatoria.
      if (!(celdas[0].textContent || '').replace(/\u00a0/g, ' ').trim()) {
        return { matrizInvalida: 'proposito-vacio' };
      }
    }

    return null;
  }
}
