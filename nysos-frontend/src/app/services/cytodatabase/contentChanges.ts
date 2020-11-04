import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { AsyncContent } from './asyncContent';

export interface ContentChangesInterface {
  contentsToUpdate: Set<string>;
  contents: { [id: string]: string };
  objectDataToUpdate: Set<string>;
  datas: { [id: string]: any };
}

const CONTENTCHANGESSAVE_KEY = 'contentchangessave';

export class ContentChanges implements ContentChangesInterface {
  private contentChangesBS: ReplaySubject<ContentChangesInterface>;
  readonly contentChangesObs: Observable<ContentChangesInterface>;

  constructor(
    readonly datas = {},
    readonly contents = {},
    readonly contentsToUpdate = new Set<string>(),
    readonly objectDataToUpdate = new Set<string>()
  ) {
    Object.keys(datas).forEach((key) => objectDataToUpdate.add(key));
    Object.keys(contents).forEach((key) => contentsToUpdate.add(key));
    this.contentChangesBS = new ReplaySubject(1);
    this.updateBS();
    this.contentChangesObs = this.contentChangesBS.asObservable();
  }

  static loadFromLocalStorage(): ContentChanges {
    const localSave = JSON.parse(localStorage.getItem(CONTENTCHANGESSAVE_KEY));
    if (!localSave) return new ContentChanges();
    return new ContentChanges(localSave.datas, localSave.contents);
  }

  saveContentChangesLocally() {
    localStorage.setItem(
      CONTENTCHANGESSAVE_KEY,
      JSON.stringify(this.toContentChangesJson())
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

  addChangesForRemoteAndSaveLocally(
    id: string,
    dataOrContent: string | object,
    update = true
  ) {
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
    update && this.updateBS();
  }

  updateBS = () => this.contentChangesBS.next(this.toContentChangesJson());

  toContentChangesJson(): ContentChangesInterface {
    return {
      contentsToUpdate: this.contentsToUpdate,
      objectDataToUpdate: this.objectDataToUpdate,
      contents: this.contents,
      datas: this.datas,
    };
  }

  getNumberOfUpdates() {
    return this.contentsToUpdate.size + this.objectDataToUpdate.size;
  }

  static getNumberOfUpdates(contentChanges: ContentChangesInterface) {
    return (
      contentChanges.contentsToUpdate.size +
      contentChanges.objectDataToUpdate.size
    );
  }
}
