import { saveOneDocument } from "./mongo";
import { Request, Response } from "express";
import { identifyGoogleUser } from "./identifyUser";
const bodyParser = require("body-parser");
var cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/savecontent", async function (req: Request, res: Response) {
  let token = "" + req.query.token;
  const id = await identifyGoogleUser(token);
  try {
    const success = await saveOneDocument(req.body.contentId, req.body.content);
    res.send({ success, id });
  } catch (err) {
    console.log("index.ts err", err);
  }
});

app.listen(3000);
