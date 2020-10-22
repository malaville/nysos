import { MongoError, Collection, UpdateWriteOpResult } from "mongodb";

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://backend:backendPassword@cluster0.uzusy.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
export const saveOneDocument = async (contentId: string, content: string) => {
  return new Promise((resolve, reject) => {
    client.connect((err: MongoError) => {
      const collection: Collection = client.db("nysos").collection("default");
      collection
        .updateOne(
          { _id: "content:" + contentId },
          { $set: { _id: "content:" + contentId, content } },
          { upsert: true }
        )
        .then((update: UpdateWriteOpResult) => {
          if (update.matchedCount === 1) {
            console.log(
              "saveOneDocument saved " + contentId,
              ">>>>>>> " + content.slice(0, 40) + "..."
            );
            resolve(true);
          } else {
            if (update.upsertedCount === 1) {
              console.log(
                "saveOneDocument created " + contentId,
                ">>>>>>> " + content.slice(0, 40) + "..."
              );
              resolve(true);
            } else {
              reject(update);
            }
          }
        })
        .catch((err) => {
          client.close();
          reject(err);
        });
    });
  });
};
