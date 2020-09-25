import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';
export interface DocumentDataStateInterface {
  title: string;
  contentId: string;
  content: string[];
}
@Injectable({
  providedIn: 'root',
})
export class AppstateService {
  sidenavref: MatSidenav;

  private documentState: DocumentDataStateInterface = {
    title: undefined,
    contentId: undefined,
    content: LOREM_IPSUMS,
  };
  private documentStateBS = new BehaviorSubject(this.documentState);
  readonly documentStateObservable = this.documentStateBS.asObservable();

  constructor() {}

  setSidenavRef(sidenavref: MatSidenav) {
    this.sidenavref = sidenavref;
  }

  contentSelected(id: string, name: string) {
    this.documentState.title = name;
    this.documentState.contentId = id;
    this.documentStateBS.next(this.documentState);

    this.sidenavref.open();
  }
}

const LOREM_IPSUMS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae odio et leo mattis ullamcorper a quis velit. Quisque tempus odio eu porttitor dictum. Quisque interdum enim nec mollis dignissim. Sed a semper ligula. Vivamus bibendum diam at metus vulputate ultricies. Sed luctus enim et libero consequat tristique. Duis tincidunt, sapien sed volutpat convallis, velit velit imperdiet ex, vitae eleifend metus dolor at magna. Sed a tristique lorem. Sed at bibendum nulla, nec dignissim odio. Duis quis sodales felis. Duis sed tincidunt turpis. Sed consequat massa ullamcorper efficitur aliquam.\
 Integer at nisi id felis malesuada tempor. Donec posuere lacus ligula, nec posuere ante blandit non.',
  'Duis bibendum porttitor nisl, interdum blandit elit hendrerit quis. Cras ut felis fringilla, sodales neque vel, facilisis elit. Proin feugiat, magna sed iaculis lobortis, dolor nisi aliquam turpis, non tristique erat purus aliquam ligula.\
 Nulla posuere commodo dictum. Phasellus at gravida ligula, ac congue augue. Maecenas semper, massa non accumsan bibendum, urna nisi condimentum tellus, ut viverra massa odio a leo. Ut ullamcorper ipsum lectus, quis ultricies urna vestibulum sit amet. Morbi pulvinar pretium ex id convallis. Donec eu feugiat dui.',
  'Morbi suscipit, urna quis tincidunt porttitor, nisl elit pellentesque quam, nec elementum odio mauris quis lorem. Integer vitae sem ac elit mollis varius sit amet nec purus. Morbi vitae luctus sem. Nullam viverra lobortis massa, eget tempus mauris suscipit vel. Quisque at elementum purus. Phasellus massa massa, rhoncus a accumsan et, convallis eget tellus. Proin porta semper augue, a rhoncus magna facilisis et. Nulla at lectus sit amet eros vehicula porttitor et nec velit.\
 Fusce felis justo, viverra quis enim sed, hendrerit commodo nisl. In eu ligula varius, rutrum massa eget, viverra metus. Aliquam erat volutpat. Phasellus lobortis nunc massa, eget ultricies augue faucibus id. Nullam eget maximus est. Phasellus eu convallis lectus. Morbi et augue at risus ullamcorper dapibus. Proin ut dictum sem. Ut mollis quis augue nec tempor. Pellentesque vitae sodales nunc.',
];
