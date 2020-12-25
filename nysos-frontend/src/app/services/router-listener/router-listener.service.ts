import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

type Scope = {
  isShared: boolean;
  targetId: string;
};

@Injectable({
  providedIn: 'root',
})
export class RouterListenerService {
  private _currentScope: Scope | undefined;
  private currentScopeBS = new BehaviorSubject<Scope | undefined>(undefined);

  private distinctScopes = distinctUntilChanged(
    (a: Scope | undefined, b: Scope | undefined) => {
      if (a === undefined && b === undefined) return true;
      if (b === undefined || a === undefined) return false;
      if (a.isShared === b.isShared && a.targetId === b.targetId) return true;
      return false;
    }
  );
  readonly currentScope$ = this.currentScopeBS
    .asObservable()
    .pipe(this.distinctScopes);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.updateScope(event.url);
      });
  }

  private updateScope(url: string) {
    if (!this.isShareRoute(url)) this._currentScope = undefined;
    else {
      this._currentScope = {
        isShared: true,
        targetId: this.getTargetId(url),
      };
    }
    this.currentScopeBS.next(this._currentScope);
  }

  private isShareRoute = (url: string): boolean => {
    if (url.split('/')[1].toLowerCase() !== 'share') return false;
    if (url.split('/').length <= 2) return false;
    return true;
  };

  private getTargetId = (url: string): string => {
    return url?.split('/')[2];
  };
}
