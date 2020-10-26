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
