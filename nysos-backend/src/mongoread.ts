import {
  CytoscapeJsObjectInterface,
  fromDatabaseToCytoscapeObj,
} from "./cytoscapemodel";
import { client, ContentInterface, ObjectDataInterface } from "./mongodefs";

export const getOneDocument = async (contentId: string, uid: number) => {
  return new Promise<ContentInterface>(async (resolve, reject) => {
    if (!contentId) {
      reject({ name: "NoContentId" });
      return;
    }
    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch (err) {
        reject(err);
        return;
      }
    }
    const collection = client.db("nysos").collection(`${uid}:content`);
    const document: ContentInterface | null = await collection.findOne({
      _id: contentId,
    });
    if (!document) {
      reject({ name: "DocumentNotFound" });
      return;
    }
    console.log(
      `${new Date().toISOString()} getOneDocument ${contentId} >>>>>>> ${document.content.slice(
        0,
        40
      )} ...`
    );
    resolve(document);
    return;
  });
};

export const getAllData = async (uid: number) => {
  return new Promise<CytoscapeJsObjectInterface[]>(async (resolve, reject) => {
    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch (err) {
        reject(err);
        return;
      }
    }
    const collection = client.db("nysos").collection(`${uid}:data`);
    const allData = await collection.find<ObjectDataInterface>();
    if (!allData) {
      reject({ name: "GetAllDataRejected" });
      return;
    }
    allData
      .toArray()
      .then((array) => {
        console.log(
          `${new Date().toISOString()} getAllData ${array.length} elements ...`
        );
        resolve(array.map((data) => fromDatabaseToCytoscapeObj(data)));
      })
      .catch((err) => {
        reject(err);
      });
  });
};
