export enum EDGE_TYPES {
  IDEA_LINK = 'IDEA_LINK',
  DOCUMENT_ON_THEME = 'DOCUMENT_LINK',
  DOCUMENT_ON_RELATION = 'DOCUMENT_ON_RELATION',
}

export enum NODE_TYPES {
  DOCUMENT_NODE = 'DOCUMENT_NODE',
  THEME_NODE = 'THEME_NODE',
}

export type ElementSelectedEvent = {
  id: string;
  data: any;
  type: EDGE_TYPES | NODE_TYPES;
};
