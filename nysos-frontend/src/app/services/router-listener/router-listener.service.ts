import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  RouterState,
} from '@angular/router';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalDatabaseService } from '../local-database/local-database.service';

@Injectable({
  providedIn: 'root',
})
export class RouterListenerService {
  private _currentScope: string;
  private currentScopeRS = new ReplaySubject<string>();
  readonly currentScope = this.currentScopeRS.asObservable();

  constructor(private router: Router, private storage: LocalDatabaseService) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        console.log(
          '==>',
          event.url,
          isShareRoute(event.url),
          getShareId(event.url)
        );
        if (isShareRoute(event.url)) {
          this.storage.setScope(getShareId(event.url));
        } else {
          this.storage.resetScope();
        }
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
