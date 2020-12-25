import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RouterListenerService {
  private _currentScope: string;
  private currentScopeRS = new ReplaySubject<string>();
  readonly currentScope = this.currentScopeRS.asObservable();

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        console.log(
          '==>',
          event.url,
          isShareRoute(event.url),
          getShareId(event.url)
        );
        this.updateScope(getShareId(event.url));
      });
  }

  private updateScope(scope: string) {
    const same = this._currentScope == scope;
    if (!same) {
      this._currentScope = scope;
      this.currentScopeRS.next(scope);
    }
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
