import { AbstractControl,ValidationErrors,ValidatorFn } from "@angular/forms";

export function UrlValidator(str:string):ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null  => {
      try {
        let str = control.value;
        if (str.indexOf('://') === -1) {
          str = `https://${str}`;
        }
        const url = new URL(str);
        return null;
      } catch (_) {
        return { invalidUrl: true };
      }
    }
  }