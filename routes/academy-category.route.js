const express = require("express");
const categoryModel = require("../models/academy-category.model");
const academyModel = require("../models/academy.model");
const schema = require("../schema/academy-category.json");
const router = express.Router();

const { successResponse } = require("../middlewares/success-response.mdw");

router.get("/", async function (req, res) {
  const list = await categoryModel.getAll();
  successResponse(res, "Success", list);
});

router.get("/:categoryId", async function (req, res) {
  let page = req.query.page;
  let limit = req.query.limit;
  let categoryId = req.params.categoryId;
  const list = await categoryModel.getAcademyByCategoryId(
    categoryId,
    page,
    limit
  );
  return successResponse(res, "Success", list);
});

module.exports = router;
