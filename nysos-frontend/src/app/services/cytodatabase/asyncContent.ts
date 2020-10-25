import { SocialAuthService } from 'angularx-social-login';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AsyncContentStateInterface {
  resolved: boolean;
  resolving: boolean;
  failed: boolean;
  content: string;
}

export class AsyncContent {
  private _asyncContentState: AsyncContentStateInterface;
  private asyncContentStateBS: BehaviorSubject<AsyncContentStateInterface>;
  public asyncContentState: Observable<AsyncContentStateInterface>;

  constructor(public contentId: string) {
    this._asyncContentState = {
      resolved: false,
      resolving: false,
      failed: false,
      content: undefined,
    };
    this.asyncContentStateBS = new BehaviorSubject(this._asyncContentState);
    this.asyncContentState = this.asyncContentStateBS.asObservable();
  }

  updateState(update: Partial<AsyncContentStateInterface>) {
    this._asyncContentState = { ...this._asyncContentState, ...update };
    this.asyncContentStateBS.next(this._asyncContentState);
  }

  async attemptFetching(authToken: string) {
    this.updateState({ resolving: true });
    try {
      const resp = await fetch(
        `http://localhost:3000/content/${this.contentId}?token=${authToken}`,
        {
          method: 'GET',
          mode: 'cors',
          cache: 'default',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const respJson = await resp.json();
      const content = respJson.content;
      this.updateState({ resolving: false, resolved: true, content });
    } catch (err) {
      this.updateState({ resolving: false, failed: true });
    }
  }
}
