const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.mdw");
const outlineModel = require("../models/academy-outline.model");
const { successResponse } = require("../middlewares/success-response.mdw");

router.get("/detail/:id", auth, async function (req, res) {
  let id = req.params.id;
  const outline = await outlineModel.getOutlineById(id);
  successResponse(res, "Success", outline);
});

module.exports = router;
