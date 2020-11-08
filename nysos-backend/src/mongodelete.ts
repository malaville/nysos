import { app, TEST_ORIGIN } from ".";
import { client } from "./mongodefs";
export const deleteAllMyData = async (
  uid: number
): Promise<[boolean, boolean]> => {
  if (!client.isConnected()) {
    await client.connect().catch((err) => {
      console.log("Error on client.connect");
      throw err;
    });
  }
  const testOrigin = app.get(TEST_ORIGIN);
  if (!testOrigin) {
    throw "Not allowed to delete everything on prod";
  }
  const dbName = `nysos${testOrigin ? "-test" : ""}`;
  const delData = client
    .db(dbName)
    .dropCollection(`${uid}:data`)
    .catch((err) => {
      if (err.codeName == "NamespaceNotFound") return true;
      throw err;
    });
  const delContent = client
    .db(dbName)
    .dropCollection(`${uid}:content`)
    .catch((err) => {
      if (err.codeName == "NamespaceNotFound") return true;
      throw err;
    });
  console.log(
    `${new Date().toISOString()} deleteAllMyData of ${uid} ${dbName} `
  );
  return Promise.all([delContent, delData]);
};

export const deleteOneDocument = async (contentId: string, uid: number) => {
  return new Promise<boolean>(async (resolve, reject) => {
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
    try {
      await collection.deleteOne({ _id: contentId }).then((update) => {
        console.log(
          `${new Date().toISOString()} deleteOneDocument DELETED  ${contentId}`
        );
        resolve(true);
      });
    } catch (err) {
      reject(false);
      throw err;
    }
  });
};

export const deleteOneObjectData = async (contentId: string, uid: number) => {
  return new Promise<boolean>(async (resolve, reject) => {
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
    const collection = client.db(dbName).collection(`${uid}:data`);
    try {
      await collection.deleteOne({ _id: contentId }).then((update) => {
        console.log(
          `${new Date().toISOString()} deleteOneObjectData DELETED  ${contentId}`
        );
        resolve(true);
      });
    } catch (err) {
      reject(false);
      throw err;
    }
  });
};
