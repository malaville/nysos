import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://backend:backendPassword@cluster0.uzusy.gcp.mongodb.net/nysos?retryWrites=true&w=majority";

const params = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
export const client = new MongoClient(uri, params);

export interface ContentInterface {
  _id: string;
  content: string;
}

export interface ObjectDataInterface {
  _id: string;
  name: string;
  type: string;
  parent?: string;
  source?: string;
  target?: string;
  link?: string;
  title?: string;
  author?: string;
  position?: { x: number; y: number };
}
