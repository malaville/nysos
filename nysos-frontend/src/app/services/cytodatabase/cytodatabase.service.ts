import { Injectable, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { CollectionReturnValue, Core } from 'cytoscape';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AsyncContent } from './asyncContent';
import { ContentChanges, ContentChangesInterface } from './contentChanges';
import {
  deleteAllMyData,
  deleteDataOfElement,
  fetchAllData,
  importAllMyDataToTestEnv,
  postContent,
  postData,
} from './fetchNysosBackend';
const CYTOSAVE_KEY = 'cytosave';

export interface ContentSaveStateInterface {
  writing: boolean;
  saving: boolean;
  saved: boolean;
  error: boolean;
  offline: boolean;
  progress: { total: number; success: number; failed: number };
}

const defaultContentSaveState = {
  writing: false,
  saving: false,
  saved: false,
  error: false,
  offline: true,
  progress: undefined,
};

@Injectable({
  providedIn: 'root',
})
export class CytodatabaseService {
  authToken: string;

  private contentChanges: ContentChanges;
  readonly contentChangesObs: Observable<ContentChangesInterface>;

  private contentSaveState: ContentSaveStateInterface = defaultContentSaveState;
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
    this.authService.authState.subscribe((st) => {
      this.authToken = st?.authToken;
    });
    this.contentChangesObs
      .pipe(debounceTime(2000))
      .subscribe((contentChanges: ContentChangesInterface) => {
        this.handleAfterContentChanges(this.contentSaveState, contentChanges);
        if (this.contentSaveState.error) {
          console.warn('Content was not saved', this.contentChanges.contents);
          console.warn('Data was not saved for : ', this.contentChanges.datas);
        }
        if (this.contentSaveState.offline) {
          console.warn(
            `There are ${this.contentChanges.getNumberOfUpdates()} contents or data updates stored locally`
          );
        }
      });
  }

  deleteAllMyRemoteData() {
    return deleteAllMyData(this.authToken).then(() =>
      this._snackBar.open(
        'All data was deleted on remote. To erase everything, also erase local data.',
        undefined,
        { duration: 2000 }
      )
    );
  }

  importMyData() {
    this.updateContentSaveState({ saving: true });
    return importAllMyDataToTestEnv(this.authToken).then((x) => {
      this.updateContentSaveState({ saving: false, saved: true });
      return x;
    });
  }

  deleteAllMyLocalData() {
    return localStorage.clear();
  }
  changesAreWaiting() {
    return this.contentChanges.getNumberOfUpdates() > 0;
  }

  goOffline() {
    this.updateContentSaveState({ offline: true, saved: false });
  }

  async handleAfterContentChanges(
    state: ContentSaveStateInterface,
    contentChanges: ContentChangesInterface
  ) {
    this.updateContentSaveState({ writing: false });
    if (state.offline) {
      // Do Nothing
    }
    if (!state.offline) {
      // Show saving loader
      this.updateContentSaveState({ saving: true });
      if (state.error) {
        // tryToSave
        // If fails go offline, erase error
        // If success error = false, saved = true All good :)
        try {
          await this.saveAllContentsAndDataToDatabase(contentChanges);
          this.updateContentSaveState({ error: false, saved: true });
        } catch (err) {
          this.updateContentSaveState({ offline: true, error: false });
          this._snackBar.open(
            'Going offline, click on cloud icon to retry...',
            undefined,
            { duration: 2000 }
          );
        }
      } else {
        // tryToSave
        // If fails set an error
        try {
          await this.saveAllContentsAndDataToDatabase(contentChanges);
          this.updateContentSaveState({ saved: true });
        } catch (err) {
          this.updateContentSaveState({ error: true });
        }
      }
      this.updateContentSaveState({ saving: false });
    }
  }

  async trySaveLocalContentChanges(): Promise<void> {
    const contentChanges = this.contentChanges.toContentChangesJson();
    this.updateContentSaveState({ saving: true });
    this._snackBar.open(
      "Local changes were detected, we're uploading them ...",
      undefined,
      { duration: 2000 }
    );
    try {
      await this.saveAllContentsAndDataToDatabase(contentChanges);
      this.updateContentSaveState({
        saving: false,
        saved: true,
      });
    } catch (err) {
      this.updateContentSaveState({
        saving: false,
      });
      throw err;
    }
  }

  setOnline() {
    this.updateContentSaveState({ offline: false });
  }

  updateContentSaveState(update: Partial<ContentSaveStateInterface>) {
    this.contentSaveState = { ...this.contentSaveState, ...update };
    this.contentSaveStateBS.next(this.contentSaveState);
  }

  updateProgress(success: number, failed: number) {
    this.contentSaveState.progress.success += success;
    this.contentSaveState.progress.failed += failed;
    this.contentSaveStateBS.next(this.contentSaveState);
  }

  saveNodesAndEdgesLocally(elements: CollectionReturnValue) {
    localStorage.setItem(CYTOSAVE_KEY, JSON.stringify(elements.jsons()));
  }

  loadFromLocalStorage(): { data: any } {
    const cytosave = JSON.parse(localStorage.getItem(CYTOSAVE_KEY));
    return cytosave;
  }

  tryFetchFromRemote(): Promise<any> {
    return fetchAllData(this.authToken)
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

  async loadFromRemote(): Promise<{ data: any }> {
    let attempts = 0;
    let MAX_ATTEMPTS = 10;
    let data = undefined;

    if (!this.authToken) {
      try {
        await this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
      } catch (err) {
        throw { name: 'NoAuthentication' };
      }
    }

    const snackMessage = this.contentSaveState.error
      ? "There was an error, we're still going to try getting data from remote ..."
      : 'Loading from remote ...';
    this._snackBar.open(snackMessage, undefined, {
      duration: 2000,
    });

    // Loop on trying to fetch
    let timeoutReached = false;
    setTimeout(() => (timeoutReached = true), 1000);
    while (!timeoutReached && attempts < MAX_ATTEMPTS && !data) {
      try {
        data = await this.tryFetchFromRemote();
        if (!data) throw { name: 'DataUndefined' };
      } catch (err) {
        attempts += 1;
      }
    }

    //////////////////
    //  After the loop :
    // - data not defined => throw
    // - data defined but empty => throw {saveAll:true
    //  -data defined and not empty => return :)

    if (data) {
      if (data.length == 0) {
        this._snackBar.open(
          "Remote Data was empty, we're saving your local data online",
          'GOT IT',
          {
            duration: 5000,
          }
        );
        throw { name: 'DataEmpty', empty: true };
      }
      // this.loadCytocoreWithSave(cytocore, data);
      // cytocore.fit(undefined, 100);
      this.updateContentSaveState({ saved: true });
      return { data };
    } else {
      this._snackBar.open(
        "Remote unreachable... you're working offline",
        undefined,
        {
          duration: 2000,
        }
      );
      this.updateContentSaveState({ offline: true, saved: false });
      throw { name: `MaxAttemptsReached${MAX_ATTEMPTS}` };
    }
  }

  saveDataOrContentOf(id: string, dataOrContent: string | object) {
    !id && console.error('Data or content without objectId', dataOrContent);
    this.contentChanges.addChangesForRemoteAndSaveLocally(id, dataOrContent);
    this.updateContentSaveState({
      writing: true,
      saved: false,
      saving: false,
    });
  }

  deleteDataAndContentOf(id: string) {
    this.contentChanges.addChangesForRemoteAndSaveLocally(id, undefined, {
      delete: true,
    });
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
          this.updateProgress(1, 0);
          return true;
        } else {
          this.updateProgress(0, 1);
          throw { name: 'MongoDbNotASuccess', jsonRes };
        }
      }
    );
  }
  async deleteOneContentAndDataInDatabase(elementId: string): Promise<boolean> {
    return deleteDataOfElement(this.authToken, elementId).then(
      (jsonRes: { success: boolean }) => {
        if (jsonRes.success) {
          this.contentChanges.deleteContentAndDataSuccessful(elementId);
          this.updateProgress(1, 0);
          return true;
        } else {
          this.updateProgress(0, 1);
          throw { name: 'MongoDbNotASuccess', jsonRes };
        }
      }
    );
  }

  saveAllContentsAndDataToDatabase(
    contentChanges: ContentChangesInterface
  ): Promise<boolean[]> {
    const total = ContentChanges.getNumberOfUpdates(contentChanges);
    if (total == 0) {
      return Promise.resolve([]);
    }
    this.updateContentSaveState({
      progress: {
        success: 0,
        failed: 0,
        total,
      },
    });
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
      ...Array.from(contentChanges.objectsToDelete).map((elementId) =>
        this.deleteOneContentAndDataInDatabase(elementId)
      ),
    ]).then((res) => {
      setTimeout(
        () => this.updateContentSaveState({ progress: undefined }),
        5000
      );
      return res;
    });
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
          this.updateProgress(1, 0);
          return true;
        } else {
          this.updateProgress(0, 1);
          throw { name: 'MongoDbNotASuccess', jsonRes };
        }
      });
  }

  loadContentOf(id: string): string {
    return localStorage.getItem(`${id}:content`) || '';
  }

  loadRemoteContentOf(id: string): AsyncContent {
    if (!this.contentSaveState.offline)
      return new AsyncContent(id).attemptFetching(this.authToken);
    return new AsyncContent(id).forcedFail();
  }

  saveAllToRemote(cytocore: Core) {
    cytocore.nodes().map((node) => {
      this.contentChanges.addChangesForRemoteAndSaveLocally(
        node.id(),
        { ...node.data(), position: node.position() },
        { update: false }
      );
      const content = this.loadContentOf(node.id());
      content &&
        this.contentChanges.addChangesForRemoteAndSaveLocally(
          node.id(),
          content,
          { update: false }
        );
    });
    cytocore.edges().map((edge) => {
      this.contentChanges.addChangesForRemoteAndSaveLocally(
        edge.id(),
        edge.data(),
        { update: false }
      );
      const content = this.loadContentOf(edge.id());
      content &&
        this.contentChanges.addChangesForRemoteAndSaveLocally(
          edge.id(),
          content,
          { update: false }
        );
    });
    this.contentChanges.updateBS();
  }
}
