const express = require("express");
const academyModel = require("../models/academy.model");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const auth = require("../middlewares/auth.mdw");

const { successResponse } = require("../middlewares/success-response.mdw");

require("dotenv").config();

router.get("/top3highlight", async function (req, res) {
  const list = await academyModel.top3Highlight();
  return successResponse(res, "Success", list);
});

router.get("/top10view", async function (req, res) {
  const list = await academyModel.top10View();
  return successResponse(res, "Success", list);
});

router.get("/top10latest", async function (req, res) {
  const list = await academyModel.top10Latest();
  return successResponse(res, "Success", list);
});

module.exports = router;
