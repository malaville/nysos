import {
  copyProdToTest,
  saveOneDocument,
  saveOneObjectData,
} from "./mongowrite";
import express, { NextFunction, Request, Response } from "express";
import { identifyGoogleUser } from "./identifyUser";
import { getAllData, getOneDocument } from "./mongoread";
import {
  deleteAllMyData,
  deleteOneDocument,
  deleteOneObjectData,
} from "./mongodelete";
const bodyParser = require("body-parser");
var cors = require("cors");
export const TEST_ORIGIN = "TEST_ORIGIN";
export const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("*", async function (req: Request, res: Response, next: NextFunction) {
  if (
    !req.headers.origin ||
    req.headers.origin.includes("localhost") ||
    req.headers.origin.includes("test") ||
    req.headers.origin.includes("stage")
  ) {
    console.log(
      `${new Date().toISOString()} TEST host was detected on ${
        req.baseUrl
      } [host: ${req.headers.host?.slice(0, 30)}]`
    );
    app.set(TEST_ORIGIN, true);
    res.setHeader("env", "test");
  } else {
    res.setHeader("env", "prod");
    app.set(TEST_ORIGIN, false);
  }

  next();
});

app.post("/content/:id", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  let uid = undefined;
  try {
    uid = await identifyGoogleUser(token);
  } catch (err) {
    console.log("identifyUser failed", err.name);
    res.statusCode = 401;
    res.send(err);
    return;
  }
  try {
    const success = await saveOneDocument(req.params.id, req.body.content, uid);
    res.send({ success, uid });
  } catch (err) {
    console.log("saveOneDocumentFailed", err.name);
    res.statusCode = 404;
    res.send({ err });
  }
});

app.post("/data/:id", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  let uid = undefined;
  try {
    uid = await identifyGoogleUser(token);
  } catch (err) {
    console.log("identifyUser failed", err.name);
    res.statusCode = 401;
    res.send(err);
    return;
  }
  try {
    const success = await saveOneObjectData(req.params.id, req.body.data, uid);
    res.send({ success, uid });
  } catch (err) {
    console.log("saveOneObjectData failed", err.name);
    res.statusCode = 404;
    res.send({ err });
  }
});

app.get("/content/:contentId", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  let uid = undefined;
  try {
    uid = await identifyGoogleUser(token);
  } catch (err) {
    console.log("identifyUser failed", err.name);
    res.statusCode = 401;
    res.send(err);
    return;
  }
  try {
    const document = await getOneDocument(req.params.contentId, uid);
    const { _id, content } = document;
    res.send({ id: _id, content });
  } catch (err) {
    console.log("getOneDocument failed", err.name);
    res.statusCode = 404;
    res.send({ err });
  }
});

app.get("/data", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  let uid = undefined;
  try {
    uid = await identifyGoogleUser(token);
  } catch (err) {
    console.log("identifyUser failed", err.name);
    res.statusCode = 401;
    res.send(err);
    return;
  }
  try {
    const allData = await getAllData(uid);

    res.send(allData);
  } catch (err) {
    console.log("getAllData failed", err.name);
    res.statusCode = 404;
    res.send({ err });
  }
});

app.delete("/", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  let uid = undefined;
  try {
    uid = await identifyGoogleUser(token);
  } catch (err) {
    console.log("identifyUser failed", err.name);
    res.statusCode = 401;
    res.send(err);
    return;
  }
  try {
    const [delContent, delData] = await deleteAllMyData(uid);

    res.send({ delContent, delData });
  } catch (err) {
    console.log("deleteAllMyData failed", err.name);
    res.statusCode = 400;
    res.send({ err });
  }
});

app.delete("/:elementId", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  let uid = undefined;
  try {
    uid = await identifyGoogleUser(token);
  } catch (err) {
    console.log("identifyUser failed", err.name);
    res.statusCode = 401;
    res.send(err);
    return;
  }
  try {
    const delContent = await deleteOneDocument(req.params.elementId, uid);
    const delData = await deleteOneObjectData(req.params.elementId, uid);

    res.send({ success: delContent && delData });
  } catch (err) {
    console.log("deleteOneDocument or ObjectData failed", err.name);
    res.statusCode = 400;
    res.send({ err });
  }
});

app.get("/", async function (req: Request, res: Response) {
  console.log(`${new Date().toISOString()} get on /`);
  res.statusCode = 200;
  res.send("Hi 😀");
});

app.get("/synctestandprod", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  let uid = undefined;
  try {
    uid = await identifyGoogleUser(token);
  } catch (err) {
    console.log("identifyUser failed", err.name);
    res.statusCode = 401;
    res.send(err);
    return;
  }
  try {
    const [delContent, delData] = await deleteAllMyData(uid);
    const copied = await copyProdToTest(uid);

    res.send({
      success: delContent && delData && copied,
      delContent,
      delData,
      copied,
    });
  } catch (err) {
    console.log("deleteOneDocument or ObjectData failed", err.name);
    res.statusCode = 400;
    res.send({ err });
  }
});

app.listen(3000);

exports.function = app;
