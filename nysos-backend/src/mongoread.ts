import { app, TEST_ORIGIN } from ".";
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
    const testOrigin = app.get(TEST_ORIGIN);
    const dbName = `nysos${testOrigin ? "-test" : ""}`;
    const collection = client.db(dbName).collection(`${uid}:content`);
    const document: ContentInterface | null = await collection.findOne({
      _id: contentId,
    });
    if (!document) {
      resolve({ content: "", _id: contentId });
      return;
    }
    console.log(
      `${new Date().toISOString()} getOneDocument ${contentId} >>>>>>> ${document.content?.slice(
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
    const testOrigin = app.get(TEST_ORIGIN);
    const dbName = `nysos${testOrigin ? "-test" : ""}`;
    const collection = client.db(dbName).collection(`${uid}:data`);
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
