import { IncomingMessage } from "http";

import https from "https";

export const identifyGoogleUser = (token: string) =>
  new Promise<number>((resolve, reject) => {
    https.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,

      (httpresp: IncomingMessage) => {
        let data = "";

        // A chunk of data has been recieved.
        httpresp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        httpresp.on("end", () => {
          const dataObj = JSON.parse(data);
          if (dataObj["err"]) {
            reject(dataObj);
          }
          if (dataObj["user_id"]) {
            resolve(parseInt(dataObj["user_id"]));
          } else {
            reject({ err: "Unknown" });
          }
        });
      }
    );
  });
