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
    const collection = client.db("nysos").collection(`${uid}:content`);
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

    const collection = client.db("nysos").collection(`${uid}:data`);
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
