import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  RouterState,
} from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RouterListenerService {
  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) =>
        console.log(
          '==>',
          event.url,
          isShareRoute(event.url),
          getShareId(event.url)
        )
      );
  }
}

const isShareRoute = (url: string): boolean => {
  if (url.split('/')[1].toLowerCase() !== 'share') return false;
  if (url.split('/').length <= 2) return false;
  return true;
};

const getShareId = (url: string): string => {
  return url?.split('/')[2];
};
