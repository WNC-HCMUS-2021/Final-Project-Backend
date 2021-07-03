const express = require("express");
const academyModel = require("../models/academy.model");
const router = express.Router();

const auth = require("../middlewares/auth.mdw");

const { successResponse } = require("../middlewares/success-response.mdw");

require("dotenv").config();

router.get("/detail/:id", async function (req, res) {
  let id = req.params.id;
  await academyModel.addView(id);
  const list = await academyModel.single(id);
  return successResponse(res, "Success", list);
});

router.get("/outline/:id", async function (req, res) {
  let id = req.params.id;
  const list = await academyModel.getOutline(id);
  return successResponse(res, "Success", list);
});

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

router.get("/search", async function (req, res) {
  let keyword = req.query.keyword;
  let page = req.query.page;
  let limit = req.query.limit;
  let orderby =
    req.query.orderby != "asc" && req.query.orderby != "desc"
      ? "desc"
      : req.query.orderby;

  let list;
  if (!keyword) {
    list = await academyModel.getAll(orderby, page, limit);
  } else {
    list = await academyModel.search(keyword, orderby, page, limit);
  }

  return successResponse(res, "Success", list);
});

module.exports = router;
