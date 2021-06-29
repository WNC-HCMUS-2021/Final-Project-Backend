const express = require("express");
const userModel = require("../models/user.model");
const router = express.Router();
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
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

    let existUsername = await userModel.singleByUserName(user.username);
    if (existUsername) {
      return res.status(400).json({ message: "Username already exist!" });
    }

    let existEmail = await userModel.getByEmail(user.email);
    if (existEmail) {
      return res.status(400).json({ message: "Email already exist!" });
    }

    let existPhone = await userModel.getByPhone(user.phone_number);
    if (existPhone) {
      return res.status(400).json({ message: "Phone number already exist!" });
    }

    user.password = bcrypt.hashSync(user.password, 10);

    const ids = await userModel.add(user);
    user.user_id = ids[0];

    const payload = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: "student",
    };
    const opts = {
      expiresIn: 10 * 60, // seconds
    };
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, opts);

    const refreshToken = randomstring.generate(80);
    console.log(payload);
    await userModel.patchRFToken(user.user_id, refreshToken);

    return res.status(201).json({
      authenticated: true,
      accessToken,
      refreshToken,
    });
  }
);

module.exports = router;
