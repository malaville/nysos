import { saveOneDocument, saveOneObjectData } from "./mongowrite";
import { Request, Response } from "express";
import { identifyGoogleUser } from "./identifyUser";
const bodyParser = require("body-parser");
var cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
app.post("/savecontent", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  const id = await identifyGoogleUser(token);
  try {
    const success = await saveOneDocument(
      req.body.contentId,
      req.body.content,
      id
    );
    res.send({ success, id });
  } catch (err) {
    console.log("index.ts err", err);
  }
});

app.listen(3000);
