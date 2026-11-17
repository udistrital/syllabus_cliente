import { FormControl } from '@angular/forms';
import { RichTextValidator } from '../validators/richText.validator';
import {
  MAX_RICH_TEXT_LENGTH,
  htmlToText,
  normalizeRichTextValue,
  plainTextToHtml,
  sanitizeRichText
} from './html-editor.utils';

describe('html-editor.utils', () => {
  it('elimina scripts, eventos y estilos no permitidos', () => {
    const clean = sanitizeRichText(
      '<p onclick="alert(1)">a<script>alert(1)</script>' +
      '<span style="color:red;text-align:center">b</span></p>'
    );

    expect(clean).not.toContain('script');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('color');
    expect(clean).toContain('text-align: center');
  });

  it('mantiene tablas y los atributos colspan/rowspan', () => {
    const clean = sanitizeRichText(
      '<table><tr><td colspan="2" rowspan="2">x</td></tr></table>'
    );

    expect(clean).toContain('<table>');
    expect(clean).toContain('colspan="2"');
    expect(clean).toContain('rowspan="2"');
  });

  it('desenvuelve enlaces y elimina imagenes', () => {
    const clean = sanitizeRichText(
      '<p><a href="https://x.test">texto</a><img src="x.png"></p>'
    );

    expect(clean).toContain('texto');
    expect(clean).not.toContain('<a');
    expect(clean).not.toContain('<img');
  });

  it('considera vacio el html sin texto', () => {
    expect(htmlToText('<p><br></p>')).toBe('');
    expect(normalizeRichTextValue('<p><br></p>')).toBe('');
    expect(normalizeRichTextValue('<p>&nbsp;</p>')).toBe('');
  });

  it('convierte texto plano escapando caracteres y saltos', () => {
    const html = plainTextToHtml('a < b\nsegunda');

    expect(html).toContain('&lt;');
    expect(html).toContain('<p>segunda</p>');
  });
});

describe('RichTextValidator', () => {
  it('invalida contenido vacio', () => {
    expect(RichTextValidator.required(new FormControl('<p><br></p>')))
      .toEqual({ requiredRichText: true });
  });

  it('acepta contenido con texto', () => {
    expect(RichTextValidator.required(new FormControl('<p>Contenido</p>'))).toBeNull();
  });

  it('invalida cuando supera el limite', () => {
    const html = `<p>${'a'.repeat(MAX_RICH_TEXT_LENGTH + 1)}</p>`;
    const result = RichTextValidator.required(new FormControl(html));

    expect(result).toEqual(jasmine.objectContaining({ maxRichTextLength: jasmine.anything() }));
  });
});
