import { Directive, forwardRef } from '@angular/core';
import { FormControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { validateUrl } from './validateUrl';

export const URL_VALIDATOR = {
  provide: NG_VALIDATORS,
  multi: true,
  useExisting: forwardRef(() => UrlValidatorDirective),
};

@Directive({
  selector: '[formControl][url], [formControlName][url]',
  providers: [URL_VALIDATOR],
})
export class UrlValidatorDirective implements Validator {
  constructor() {}

  validate(c: FormControl) {
    return validateUrl(c);
  }
}
