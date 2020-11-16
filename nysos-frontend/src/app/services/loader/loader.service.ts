import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinct, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingBS = new BehaviorSubject(false);
  readonly loading = this.loadingBS.asObservable().pipe(distinctUntilChanged());

  constructor() {}

  setLoading(state: boolean) {
    this.loadingBS.next(state);
  }
}
