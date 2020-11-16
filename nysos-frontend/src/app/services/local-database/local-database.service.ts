import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SHARE_PARAM_KEY } from 'src/app/routingvars';

@Injectable()
export abstract class LocalDatabaseService {
  abstract _initialScope = '$SCOPE$';
  private _scope = '$SCOPE$';
  public setScope(value: string) {
    this._scope = value;
  }

  public resetScope() {
    this._scope = this._initialScope;
  }

  constructor() {}

  private generateKey = (id: string, type: string) =>
    `${this._scope}:${id}:${type}`;

  private generateSpecialKey = (key: string) => `${this._scope}:${key}`;

  saveContent(contentId: string, content: string): void {
    localStorage.setItem(this.generateKey(contentId, 'content'), content);
  }

  getContent(contentId: string, content: string): any {
    return JSON.parse(
      localStorage.getItem(this.generateKey(contentId, 'content'))
    );
  }

  saveData(dataId: string, data: any): void {
    const stringifiedData =
      typeof data == 'string' ? data : JSON.stringify(data);
    localStorage.setItem(this.generateKey(dataId, 'data'), stringifiedData);
  }

  getData(dataId: string): any {
    return JSON.parse(localStorage.getItem(this.generateKey(dataId, 'data')));
  }

  getItem(itemKey: string): string {
    return localStorage.getItem(this.generateSpecialKey(itemKey));
  }

  setItem(itemKey: string, objectString: string): void {
    localStorage.setItem(this.generateSpecialKey(itemKey), objectString);
  }

  private getScopeFromKey(key: string) {
    return key.split(':')[0];
  }

  clear() {
    let keyIndex = 0;
    let currentKey = localStorage.key(keyIndex);
    while (currentKey) {
      console.log(keyIndex);
      if (this.getScopeFromKey(currentKey) === this._scope) {
        localStorage.removeItem(currentKey);
      } else {
        keyIndex++;
        currentKey = localStorage.key(keyIndex);
      }
    }
  }
}

@Injectable()
export class RootLocalDatabaseService extends LocalDatabaseService {
  _initialScope = 'ROOT';
  constructor() {
    super();
    this.resetScope();
  }
}

@Injectable({ providedIn: 'root' })
export class ShareLocalDatabaseService extends LocalDatabaseService {
  _initialScope = 'ROOT';
  constructor(private route: ActivatedRoute) {
    super();
    this.setScope(this.route.snapshot.paramMap.get(SHARE_PARAM_KEY) || 'ROOT');
  }
}
