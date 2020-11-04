import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { AsyncContent } from './asyncContent';

export interface ContentChangesInterface {
  contentsToUpdate: Set<string>;
  contents: { [id: string]: string };
  objectDataToUpdate: Set<string>;
  datas: { [id: string]: any };
  objectsToDelete: Set<string>;
}

export interface ContentChangesSaveStringInterface {
  contentsToUpdate: string[];
  contents: { [id: string]: string };
  objectDataToUpdate: string[];
  datas: { [id: string]: any };
  objectsToDelete: string[];
}

const CONTENTCHANGESSAVE_KEY = 'contentchangessave';

export class ContentChanges implements ContentChangesInterface {
  private contentChangesBS: ReplaySubject<ContentChangesInterface>;
  readonly contentChangesObs: Observable<ContentChangesInterface>;

  constructor(
    readonly datas = {},
    readonly contents = {},
    readonly contentsToUpdate = new Set<string>(),
    readonly objectDataToUpdate = new Set<string>(),
    readonly objectsToDelete = new Set<string>()
  ) {
    Object.keys(datas).forEach((key) => objectDataToUpdate.add(key));
    Object.keys(contents).forEach((key) => contentsToUpdate.add(key));
    this.contentChangesBS = new ReplaySubject(1);
    this.updateBS();
    this.contentChangesObs = this.contentChangesBS.asObservable();
  }

  static loadFromLocalStorage(): ContentChanges {
    const localSave: ContentChangesSaveStringInterface = JSON.parse(
      localStorage.getItem(CONTENTCHANGESSAVE_KEY)
    );
    if (!localSave) return new ContentChanges();
    const objectsToDelete = new Set<string>(localSave.objectsToDelete);
    return new ContentChanges(
      localSave.datas,
      localSave.contents,
      objectsToDelete
    );
  }

  saveContentChangesLocally() {
    localStorage.setItem(
      CONTENTCHANGESSAVE_KEY,
      JSON.stringify(this.toStringifyFriendlyJson())
    );
  }

  savedDataSuccessful(objectId: string) {
    this.objectDataToUpdate.delete(objectId);
    delete this.datas[objectId];
    this.saveContentChangesLocally();
  }

  savedContentSuccessful(contentId: string) {
    this.contentsToUpdate.delete(contentId);
    delete this.contents[contentId];
    AsyncContent.contentWasPosted(contentId);
    this.saveContentChangesLocally();
  }

  deleteContentAndDataSuccessful(contentId: string) {
    this.objectsToDelete.delete(contentId);
    this.saveContentChangesLocally();
  }

  defaultParams = { update: true, delete: false };
  addChangesForRemoteAndSaveLocally(
    id: string,
    dataOrContent: string | object,
    params: Partial<{ update: boolean; delete: boolean }> = this.defaultParams
  ) {
    params = Object.assign({ ...this.defaultParams }, params);
    if (!id) {
      throw 'No Id in contentChanges:addChangesForRemoteAndSaveLocally';
    }
    if (params.delete) {
      this.objectsToDelete.add(id);
      this.contentsToUpdate.delete(id);
      delete this.contents[id];
      this.objectDataToUpdate.delete(id);
      delete this.datas[id];
    }
    if (typeof dataOrContent == 'string') {
      this.contents[id] = dataOrContent;
      this.contentsToUpdate.add(id);
      localStorage.setItem(`${id}:content`, dataOrContent);
    }
    if (typeof dataOrContent == 'object') {
      this.datas[id] = dataOrContent;
      this.objectDataToUpdate.add(id);
    }
    this.saveContentChangesLocally();
    params.update && this.updateBS();
  }

  updateBS = () => this.contentChangesBS.next(this.toContentChangesJson());

  toContentChangesJson(): ContentChangesInterface {
    return {
      contentsToUpdate: this.contentsToUpdate,
      objectDataToUpdate: this.objectDataToUpdate,
      contents: this.contents,
      datas: this.datas,
      objectsToDelete: this.objectsToDelete,
    };
  }

  toStringifyFriendlyJson(): ContentChangesSaveStringInterface {
    return {
      contentsToUpdate: Array.from(this.contentsToUpdate),
      objectDataToUpdate: Array.from(this.objectDataToUpdate),
      contents: this.contents,
      datas: this.datas,
      objectsToDelete: Array.from(this.objectsToDelete),
    };
  }

  getNumberOfUpdates() {
    return (
      this.contentsToUpdate.size +
      this.objectDataToUpdate.size +
      this.objectsToDelete.size
    );
  }

  static getNumberOfUpdates(contentChanges: ContentChangesInterface): number {
    return (
      contentChanges.contentsToUpdate.size +
      contentChanges.objectDataToUpdate.size +
      contentChanges.objectsToDelete.size
    );
  }
}
