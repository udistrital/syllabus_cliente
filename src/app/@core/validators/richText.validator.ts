import { AbstractControl, ValidationErrors } from '@angular/forms';
import { MAX_RICH_TEXT_LENGTH, htmlToText } from '../utils/html-editor.utils';

export class RichTextValidator {
  static required(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '') as string;

    if (!htmlToText(value)) {
      return { requiredRichText: true };
    }

    if (value.length > MAX_RICH_TEXT_LENGTH) {
      return { maxRichTextLength: { max: MAX_RICH_TEXT_LENGTH, actual: value.length } };
    }

    return null;
  }
}
