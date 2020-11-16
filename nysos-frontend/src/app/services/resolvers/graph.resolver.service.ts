import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';
import { first } from 'rxjs/operators';
import { SHARE_PARAM_KEY } from 'src/app/routingvars';
import { CytodatabaseService } from '../cytodatabase/cytodatabase.service';
import { LoaderService } from '../loader/loader.service';

@Injectable()
export class GraphResolver implements Resolve<any> {
  constructor(
    private cydb: CytodatabaseService,
    private loader: LoaderService,
    private authService: SocialAuthService
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    this.loader.setLoading(true);
    const graphId = route.paramMap.get(SHARE_PARAM_KEY);
    const logged = (await this.authService.authState.pipe(first()).toPromise())
      .authToken;
    return this.cydb.tryFetchFromRemote(graphId).then((graphdata) => {
      if (!graphdata.length) {
        this.loader.setLoading(false);
        throw 'err';
      }
      this.loader.setLoading(false);
      return graphdata;
    });
  }
}
