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

export const useCollectionReplication = async (
  uid: number,
  sourceSuffix: string,
  targetSuffix: string
) => {
  return new Promise(async (resolve, reject) => {
    if (!client.isConnected()) {
      await client.connect().catch((err) => reject(err));
    }

    let resolved = 0;
    const dataTypes = ["data", "content"];
    const sourceDb = "nysos" + sourceSuffix;
    const targetDb = "nysos" + targetSuffix;
    for (let dataType of dataTypes) {
      client
        .db(targetDb)
        .collection(`${uid}:${dataType}`, async (err, targetForData) => {
          var sourceOfData = await client
            .db(sourceDb)
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
                  `${new Date().toISOString()} COPIED all ${dataType} from prod to test`
                );
                resolved++;
                resolved == 2 && resolve(true);
              })
              .catch((err) => {
                console.log(
                  `Failure on bulkWrite from ${sourceDb} to ${targetDb} on ${dataType}`,
                  err
                );
                reject(false);
              });
          } else {
            console.log(
              `${new Date().toISOString()} COPIED no ${dataType} to copy`
            );
            resolved++;
            resolved == 2 && resolve(true);
          }
        });
    }
  });
};
