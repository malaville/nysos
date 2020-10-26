import { Injectable, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocialAuthService } from 'angularx-social-login';
import { CollectionReturnValue, Core } from 'cytoscape';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AsyncContent } from './asyncContent';
import { ContentChanges, ContentChangesInterface } from './contentChanges';
import { fetchAllData, postContent, postData } from './fetchNysosBackend';
const CYTOSAVE_KEY = 'cytosave';

export interface ContentSaveStateInterface {
  writing: boolean;
  saving: boolean;
  saved: boolean;
  error: boolean;
}

const defaultContentSaveState = {
  writing: false,
  saving: false,
  saved: false,
  error: false,
};

@Injectable({
  providedIn: 'root',
})
export class CytodatabaseService {
  authToken: string;

  private contentChanges: ContentChanges;
  readonly contentChangesObs: Observable<ContentChangesInterface>;

  private contentSaveState = defaultContentSaveState;
  private contentSaveStateBS = new BehaviorSubject<ContentSaveStateInterface>(
    this.contentSaveState
  );
  readonly contentSaveStateObs = this.contentSaveStateBS.asObservable();

  constructor(
    private authService: SocialAuthService,
    private _snackBar: MatSnackBar
  ) {
    this.contentChanges = ContentChanges.loadFromLocalStorage();
    this.contentChangesObs = this.contentChanges.contentChangesObs;
    this.authService.authState.subscribe(
      (st) => (this.authToken = st?.authToken)
    );
    this.contentChangesObs
      .pipe(debounceTime(1000))
      .subscribe((contentChanges: ContentChangesInterface) => {
        this.updateContentSaveState({ writing: false });
        if (!this.contentSaveState.error) {
          this.updateContentSaveState({ saving: true });
          this.saveAllContentsAndDataToDatabase(contentChanges)
            .then(() => {
              this.updateContentSaveState({ saving: false, saved: true });
            })
            .catch(() => {
              this.updateContentSaveState({ saving: false, error: true });
              console.warn(
                'Content was not saved',
                this.contentChanges.contents
              );
              console.warn(
                'Data was not saved for : ',
                this.contentChanges.datas
              );
            })
            .finally(() => this.contentChanges.saveContentChangesLocally());
        }
      });
  }

  updateContentSaveState(update: Partial<ContentSaveStateInterface>) {
    this.contentSaveState = { ...this.contentSaveState, ...update };
    this.contentSaveStateBS.next(this.contentSaveState);
  }

  saveNodesAndEdges(elements: CollectionReturnValue) {
    localStorage.setItem(CYTOSAVE_KEY, JSON.stringify(elements.jsons()));
  }

  loadFromLocalStorage(cytocore: Core) {
    console.log('From Local Storage');
    const cytosave = JSON.parse(localStorage.getItem(CYTOSAVE_KEY));
    this.loadCytocoreWithSave(cytocore, cytosave);
  }

  tryFetchFromRemote(authToken: string): Promise<any> {
    return fetchAllData(authToken)
      .then((resp) => {
        if (resp.status != 200) throw { name: 'GettingDataFailed' };
        return resp.json();
      })
      .then((respJson: { content: string }) => respJson)
      .then((respJson) => {
        return respJson;
      })
      .catch(
        (err) =>
          err.name == 'GettingContentFailed' &&
          console.warn(
            'Content was not found, probably the document is empty'
          ) + ''
      );
  }

  async loadFromRemote(cytocore: Core) {
    let attempts = 0;
    let MAX_ATTEMPTS = 2;
    let data = undefined;
    this._snackBar.open('Loading from remote ...', undefined, {
      duration: 2000,
    });
    while (attempts < MAX_ATTEMPTS && !data) {
      try {
        data = await this.tryFetchFromRemote(this.authToken);
        if (!data) throw { name: 'DataUndefined' };
      } catch (err) {
        attempts += 1;
      }
    }
    if (!this.authToken) {
      this._snackBar.open(
        "Authentication failed... you're working offline",
        'GOT IT',
        { duration: 5000 }
      );
      throw { name: 'NoAuthentication' };
    }
    if (data) {
      this.loadCytocoreWithSave(cytocore, data);
      cytocore.fit(undefined, 100);
      return true;
    } else {
      this._snackBar.open(
        "Remote unreachable... you're working offline",
        undefined,
        {
          duration: 2000,
        }
      );
      throw { name: `MaxAttemptsReached${MAX_ATTEMPTS}` };
    }
  }

  loadCytocoreWithSave(cytocore: Core, cytosave: any) {
    if (cytosave) {
      cytocore.elements().remove();
      cytocore.add(cytosave);
      return true;
    }
    return false;
  }

  saveContentOf(id: string, dataOrContent: string | object) {
    !id && console.error('Data or content without objectId', dataOrContent);
    this.contentChanges.addChanges(id, dataOrContent);
    this.updateContentSaveState({
      writing: true,
      saved: false,
      saving: false,
    });
  }

  async saveOneContentToDatabase(
    contentId: string,
    content: string
  ): Promise<boolean> {
    return postContent(this.authToken, contentId, content).then(
      (jsonRes: { success: boolean }) => {
        if (jsonRes.success) {
          this.contentChanges.savedContentSuccessful(contentId);
          return true;
        } else {
          throw { name: 'MongoDbNotASuccess', jsonRes };
        }
      }
    );
  }

  saveAllContentsAndDataToDatabase(
    contentChanges: ContentChangesInterface
  ): Promise<boolean[]> {
    return Promise.all([
      ...Array.from(contentChanges.objectDataToUpdate).map((objectId) =>
        this.saveOneObjectDataToDatabase(
          objectId,
          contentChanges.datas[objectId]
        )
      ),
      ...Array.from(contentChanges.contentsToUpdate).map((contentId) =>
        this.saveOneContentToDatabase(
          contentId,
          contentChanges.contents[contentId]
        )
      ),
    ]);
  }

  saveOneObjectDataToDatabase(objectId: string, data: any): Promise<boolean> {
    return postData(this.authToken, objectId, data)
      .then((res: Response) => {
        if (res.status != 200) {
          throw { name: `FailedStatus[${res.status}]` };
        }
        return res.json();
      })
      .then((jsonRes: any) => {
        if (jsonRes.success) {
          this.contentChanges.savedDataSuccessful(objectId);
          return true;
        } else {
          throw { name: 'MongoDbNotASuccess', jsonRes };
        }
      });
  }

  loadContentOf(id: string): string {
    return localStorage.getItem(`${id}:content`) || '';
  }

  loadRemoteContentOf(id: string): AsyncContent {
    if (!this.contentSaveState.error)
      return new AsyncContent(id).attemptFetching(this.authToken);
    return new AsyncContent(id).forcedFail();
  }
}
