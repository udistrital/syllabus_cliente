import { AbstractControl } from '@angular/forms';
import { MAX_RICH_TEXT_LENGTH } from '../utils/html-editor.utils';
import { MAX_FILAS_MATRIZ_PFA, PFAValidator } from './pfa.validator';

function matriz(filas: string[], columnas: string[] = ['Propósitos de Formación', 'Relación']): string {
  const encabezado = columnas.map((columna) => `<th>${columna}</th>`).join('');
  const cuerpo = filas
    .map((fila) => `<tr>${columnaPorDefecto(fila, columnas.length)}</tr>`)
    .join('');
  return `<table><thead><tr>${encabezado}</tr></thead><tbody>${cuerpo}</tbody></table>`;
}

function columnaPorDefecto(fila: string, cantidad: number): string {
  const celdas = Array.from({ length: Math.max(1, cantidad - 1) }, () => '<td></td>');
  return `<td>${fila}</td>${celdas.join('')}`;
}

describe('PFAValidator.matrizValida', () => {
  const control = (valor: string) => ({ value: valor } as AbstractControl);

  it('acepta una matriz con encabezado y hasta 4 filas de propósito', () => {
    expect(PFAValidator.matrizValida(control(matriz(['Propósito 1', 'Propósito 2'])))).toBeNull();
    expect(PFAValidator.matrizValida(control(matriz(['1', '2', '3', '4'])))).toBeNull();
  });

  it('rechaza un valor vacío', () => {
    expect(PFAValidator.matrizValida(control(''))).toEqual({ requiredRichText: true });
  });

  it('rechaza un contenido que no es una tabla', () => {
    expect(PFAValidator.matrizValida(control('<p>Propósito</p>'))).toEqual({ matrizInvalida: 'sin-tabla' });
  });

  it('rechaza una tabla sin fila de encabezado', () => {
    const valor = '<table><tbody><tr><td>Propósito</td><td></td></tr></tbody></table>';
    expect(PFAValidator.matrizValida(control(valor))).toEqual({ matrizInvalida: 'encabezado' });
  });

  it('rechaza una matriz con una sola columna', () => {
    expect(PFAValidator.matrizValida(control(matriz(['Propósito'], ['Propósitos de Formación'])))).toEqual({
      matrizInvalida: 'columnas',
    });
  });

  it('rechaza más de 4 filas de propósito', () => {
    const filas = Array.from({ length: MAX_FILAS_MATRIZ_PFA + 1 }, (_, index) => `Propósito ${index + 1}`);
    expect(PFAValidator.matrizValida(control(matriz(filas)))).toEqual({ matrizInvalida: 'filas' });
  });

  it('rechaza una fila sin propósito diligenciado', () => {
    expect(PFAValidator.matrizValida(control(matriz(['', 'Propósito 2'])))).toEqual({
      matrizInvalida: 'proposito-vacio',
    });
  });

  it('rechaza contenido que supera el máximo de caracteres', () => {
    const valor = `<p>${'a'.repeat(MAX_RICH_TEXT_LENGTH + 1)}</p>`;
    expect(PFAValidator.matrizValida(control(valor))).toEqual({
      maxRichTextLength: { max: MAX_RICH_TEXT_LENGTH, actual: valor.length },
    });
  });
});
