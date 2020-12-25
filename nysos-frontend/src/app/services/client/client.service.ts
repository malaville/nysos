import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BACKEND_URL } from './url.injection.token';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(
    private http: HttpClient,
    @Inject(BACKEND_URL) private url: string
  ) {}

  public fetchAllData = (authToken: string) => {
    return this.http.get(`${this.url}/data?token=${authToken}`);
  };

  public fetchAllScopeData = (authToken: string, scope: string) => {
    return this.http.get(`${this.url}/graph/${scope}/data?token=${authToken}`);
  };
}
