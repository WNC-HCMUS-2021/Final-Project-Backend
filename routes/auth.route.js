const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");

require("dotenv").config();

const userModel = require("../models/user.model");

const router = express.Router();
const { successResponse } = require("../middlewares/success-response.mdw");

router.post("/", async function (req, res) {
  const user = await userModel.singleByUserName(req.body.username);
  if (user === null) {
    return successResponse(res, "Username không tồn tại", null, 400, false);
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return successResponse(res, "Mật khẩu không đúng", null, 400, false);
  }

  const payload = {
    userId: user.user_id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  const opts = {
    expiresIn: 10 * 60, // seconds
  };
  const accessToken = jwt.sign(payload, process.env.SECRET_KEY, opts);

  const refreshToken = randomstring.generate(80);
  await userModel.patchRFToken(user.user_id, refreshToken);
  return successResponse(res, "Success", { accessToken, refreshToken });
});

router.post("/verify/:token", async function (req, res) {
  let token = await jwt.verify(req.params.token, process.env.SECRET_KEY);

  await userModel.verifyEmail(token.userId);
  return successResponse(res, "Success");
});

router.post("/refresh", async function (req, res) {
  const { accessToken, refreshToken } = req.body;
  const { userId } = jwt.verify(accessToken, process.env.SECRET_KEY, {
    ignoreExpiration: true,
  });

  const ret = await userModel.isValidRFToken(userId, refreshToken);
  if (ret === true) {
    const newAccessToken = jwt.sign({ userId }, process.env.SECRET_KEY, {
      expiresIn: 10 * 60,
    });
    return successResponse(res, "Success", { accessToken: newAccessToken });
  }
  return successResponse(res, "Refresh token is revoked!", null, 400, false);
});

module.exports = router;
