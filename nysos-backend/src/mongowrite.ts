import { app, TEST_ORIGIN } from ".";
import { client } from "./mongodefs";

export const saveOneDocument = async (
  contentId: string,
  content: string,
  uid: number
) => {
  return new Promise(async (resolve, reject) => {
    if (!client.isConnected()) {
      await client.connect().catch((err) => reject(err));
    }
    const testOrigin = app.get(TEST_ORIGIN);
    const dbName = `nysos${testOrigin ? "-test" : ""}`;
    const collection = client.db(dbName).collection(`${uid}:content`);
    collection
      .updateOne(
        { _id: contentId },
        { $set: { _id: contentId, content } },
        { upsert: true }
      )
      .then((update) => {
        if (update.matchedCount === 1) {
          console.log(
            `${new Date().toISOString()} saveOneDocument EDITED  ${contentId} >>>>>>> ${content.slice(
              0,
              40
            )} ...`
          );
          resolve(true);
        } else {
          if (update.upsertedCount === 1) {
            console.log(
              `${new Date().toISOString()} saveOneDocument CREATED ${contentId} >>>>>>> ${content.slice(
                0,
                40
              )} ...`
            );

            resolve(true);
          } else {
            reject(update);
          }
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const saveOneObjectData = async (
  objectId: string,
  data: any,
  uid: number
) => {
  return new Promise(async (resolve, reject) => {
    if (!objectId) {
      reject({ name: "NoObjectId" });
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

    delete data.id;
    if ("position" in data) {
      data.position.x = Math.floor(data.position.x);
      data.position.y = Math.floor(data.position.y);
    }

    const testOrigin = app.get(TEST_ORIGIN);
    const dbName = `nysos${testOrigin ? "-test" : ""}`;
    const collection = client.db(dbName).collection(`${uid}:data`);
    collection
      .updateOne(
        { _id: objectId },
        { $set: { _id: objectId, ...data } },
        { upsert: true }
      )
      .then((update) => {
        if (update.matchedCount === 1) {
          console.log(
            `${new Date().toISOString()} saveOneObjectData EDITED  ${objectId}`
          );
          resolve(true);
        } else {
          if (update.upsertedCount === 1) {
            console.log(
              `${new Date().toISOString()} saveOneObjectData CREATED ${objectId}`
            );

            resolve(true);
          } else {
            reject(update);
          }
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const copyProdToTest = async (uid: number) => {
  return new Promise(async (resolve, reject) => {
    if (!client.isConnected()) {
      await client.connect().catch((err) => reject(err));
    }

    let resolved = 0;

    client
      .db("nysos-test")
      .collection(`${uid}:content`, async (err, targetForContent) => {
        var sourceOfContent = await client
          .db("nysos")
          .collection(`${uid}:content`)
          .find()
          .toArray();
        if (sourceOfContent.length > 0) {
          targetForContent
            .bulkWrite(
              sourceOfContent.map((content) => ({
                insertOne: { document: content },
              }))
            )
            .then(() => {
              console.log(
                `${new Date().toISOString()} COPIED all content from prod to test`
              );
              resolved++;
              resolved == 2 && resolve(true);
            });
        } else {
          console.log(`${new Date().toISOString()} COPIED no content to copy`);
          resolved++;
          resolved == 2 && resolve(true);
        }
      });

    client
      .db("nysos-test")
      .collection(`${uid}:data`, async (err, targetForData) => {
        var sourceOfData = await client
          .db("nysos")
          .collection(`${uid}:data`)
          .find()
          .toArray();
        if (sourceOfData.length > 0) {
          targetForData
            .bulkWrite(
              sourceOfData.map((data) => ({
                insertOne: { document: data },
              }))
            )
            .then(() => {
              console.log(
                `${new Date().toISOString()} COPIED all data from prod to test`
              );
              resolved++;
              resolved == 2 && resolve(true);
            });
        } else {
          console.log(`${new Date().toISOString()} COPIED no data to copy`);
          resolved++;
          resolved == 2 && resolve(true);
        }
      });
  });
};
