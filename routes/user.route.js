const express = require("express");
const userModel = require("../models/user.model");
const router = express.Router();
const bcrypt = require("bcryptjs");

router.get("/", async function (req, res) {
  const list = await userModel.all();
  res.json(list);
});

const schema = require("../schema/user-register.json");
router.post(
  "/register",
  require("../middlewares/validate.mdw")(schema),
  async function (req, res) {
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, 10);

    const ids = await userModel.add(user);
    user.id = ids[0];
    delete user.password;

    res.status(201).json(user);
  }
);

module.exports = router;
