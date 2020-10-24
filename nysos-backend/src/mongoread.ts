import { client, ContentInterface } from "./mongodefs";

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

    resolve(document);
    return;
  });
};
