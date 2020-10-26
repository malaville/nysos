import { BehaviorSubject, Observable } from 'rxjs';
import { fetchContent } from './fetchNysosBackend';

export interface AsyncContentStateInterface {
  resolved: boolean;
  resolving: boolean;
  failed: boolean;
  content: string;
}

export class AsyncContent {
  private _asyncContentState: AsyncContentStateInterface;
  private asyncContentStateBS: BehaviorSubject<AsyncContentStateInterface>;
  readonly asyncContentState: Observable<AsyncContentStateInterface>;

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

  attemptFetching(authToken: string): AsyncContent {
    this.updateState({ resolving: true });
    (async () => {
      try {
        const respJson = await fetchContent(authToken, this.contentId);
        const content = respJson.content;
        this.updateState({ resolving: false, resolved: true, content });
      } catch (err) {
        this.updateState({ resolving: false, failed: true });
      }
    })();
    return this;
  }

  forcedFail(): AsyncContent {
    console.log('ForcedFail');
    this.updateState({ resolving: false, failed: true });
    return this;
  }
}
