import { InjectionToken } from '@angular/core';

export const BACKEND_URL = new InjectionToken<string>('Backend url', {
  providedIn: 'root',
  factory: () => {
    // return  'https://europe-west1-nysos-289715.cloudfunctions.net/nysos-backend';
    return 'https://europe-west1-nysos-289715.cloudfunctions.net/nysos-backend11';
    //  return 'http://localhost:3000';;
  },
});
