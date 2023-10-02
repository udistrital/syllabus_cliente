import { AbstractControl, ValidationErrors } from '@angular/forms';  
    
export class EmptySpaceValidator {  
    static noEmptySpaceAllowed(control: AbstractControl) : ValidationErrors | null {  
        if((control.value as string)==''){  
            return {noEmptySpaceAllowed: true}  
        }  
        return null;  
    }  
}