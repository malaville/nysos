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
  const delData = client
    .db("nysos")
    .dropCollection(`${uid}:data`)
    .catch((err) => {
      if (err.codeName == "NamespaceNotFound") return true;
      throw err;
    });
  const delContent = client
    .db("nysos")
    .dropCollection(`${uid}:content`)
    .catch((err) => {
      if (err.codeName == "NamespaceNotFound") return true;
      throw err;
    });
  console.log(`${new Date().toISOString()} deleteAllMyData of ${uid} `);
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
    const collection = client.db("nysos").collection(`${uid}:content`);
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
    const collection = client.db("nysos").collection(`${uid}:data`);
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
