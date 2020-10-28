import { saveOneDocument, saveOneObjectData } from "./mongowrite";
import { Request, Response } from "express";
import { identifyGoogleUser } from "./identifyUser";
import { getAllData, getOneDocument } from "./mongoread";
import { deleteAllMyData } from "./mongodelete";
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

app.get("/", async function (req: Request, res: Response) {
  console.log(`${new Date().toISOString()} get on /`);
  res.statusCode = 200;
  res.send("Hi 😀");
});

app.listen(3000);

exports.function = app;
