import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appIntegerValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: IntegerValidatorDirective, multi: true }]
})
export class IntegerValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && typeof value === 'string') {
      // Utilise une expression régulière pour vérifier si la chaîne contient uniquement des chiffres
      if (!/^\d+$/.test(value)) {
        return { 'integer': true };
      }
    }
    return null;
  }
}
