import { BehaviorSubject, Observable } from 'rxjs';
import { LocalDatabaseService } from '../local-database/local-database.service';
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

  private static contentStore: {
    [id: string]: any;
  } = {};

  constructor(public contentId: string, private storage: LocalDatabaseService) {
    this._asyncContentState = {
      resolved: false,
      resolving: false,
      failed: false,
      content: undefined,
    };
    this.asyncContentStateBS = new BehaviorSubject(this._asyncContentState);
    this.asyncContentState = this.asyncContentStateBS.asObservable();
  }

  static contentWasPosted(contentId: string) {
    delete AsyncContent.contentStore[contentId];
  }

  loadFromStore() {
    return AsyncContent.contentStore[this.contentId];
  }

  updateState(update: Partial<AsyncContentStateInterface>) {
    this._asyncContentState = { ...this._asyncContentState, ...update };
    this.asyncContentStateBS.next(this._asyncContentState);
  }

  attemptFetching(authToken: string): AsyncContent {
    if (this.loadFromStore() !== undefined) {
      this.updateState({ resolved: true, content: this.loadFromStore() });
      return this;
    }
    this.updateState({ resolving: true });
    (async () => {
      try {
        const respJson = await fetchContent(authToken, this.contentId);
        const content = respJson.content;
        this.updateState({ resolving: false, resolved: true, content });
        AsyncContent.contentStore[this.contentId] = content;
        this.storage.setItem(`${this.contentId}:content`, content);
      } catch (err) {
        this.updateState({ resolving: false, failed: true });
      }
    })();
    return this;
  }

  forcedFail(): AsyncContent {
    this.updateState({ resolving: false, failed: true });
    return this;
  }
}
