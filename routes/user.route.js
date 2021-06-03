const express = require("express");
const userModel = require("../models/user.model");
const router = express.Router();

router.get("/", async function (req, res) {
  const list = await userModel.all();
  res.json(list);
});

module.exports = router;
