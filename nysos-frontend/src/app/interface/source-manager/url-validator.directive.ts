import { Directive, forwardRef } from '@angular/core';
import {
  FormControl,
  NG_VALIDATORS,
  Validator,
  Validators,
} from '@angular/forms';

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

const validateUrl = (ctrl: FormControl) => {
  const myreg = new RegExp(
    '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
  );

  const valid = ctrl.value && myreg.test(ctrl.value);
  return valid
    ? null
    : {
        validateUrl: {
          valid,
        },
      };
};
