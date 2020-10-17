import { FormControl } from '@angular/forms';

export const validateUrl = (ctrl: FormControl) => {
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
