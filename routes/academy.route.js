const express = require("express");
const academy = require("../models/academy");
const router = express.Router();

router.get("/", async function (req, res) {
  const list = await academy.all();
  res.json(list);
});

module.exports = router;
