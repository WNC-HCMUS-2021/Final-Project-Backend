const express = require("express");
const userModel = require("../models/user.model");
const router = express.Router();
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const bcrypt = require("bcryptjs");

const auth = require("../middlewares/auth.mdw");

const { successResponse } = require("../middlewares/success-response.mdw");

require("dotenv").config();

router.get("/", async function (req, res) {
  const list = await userModel.all();
  res.json(list);
});

const registerSchema = require("../schema/user-register.json");
router.post(
  "/register",
  require("../middlewares/validate.mdw")(registerSchema),
  async function (req, res) {
    const user = req.body;

    let existUsername = await userModel.singleByUserName(user.username);
    if (existUsername) {
      return successResponse(res, "Username đã tồn tại", null, 409, false);
    }

    let existEmail = await userModel.getByEmail(user.email);
    if (existEmail) {
      return successResponse(res, "Email đã tồn tại", null, 409, false);
    }

    let existPhone = await userModel.getByPhone(user.phone_number);
    if (existPhone) {
      return successResponse(res, "Số điện thoại đã tồn tại", null, 409, false);
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
    return successResponse(res, "Success", {
      authenticated: true,
      accessToken,
      refreshToken,
    });
  }
);

const updateProfileSchema = require("../schema/user-update-profile.json");
router.put(
  "/update-profile",
  auth,
  require("../middlewares/validate.mdw")(updateProfileSchema),
  async function (req, res) {
    const user = req.body;

    let existEmail = await userModel.getByEmailUpdate(
      req.accessTokenPayload.username,
      user.email
    );
    if (existEmail) {
      return successResponse(res, "Email đã tồn tại", null, 409, false);
    }

    await userModel.updateProfile(
      req.accessTokenPayload.username,
      user.name,
      user.email
    );

    return successResponse(res, "Cập nhật thành công");
  }
);

const changePasswordSchema = require("../schema/user-change-password.json");
router.put(
  "/change-password",
  auth,
  require("../middlewares/validate.mdw")(changePasswordSchema),
  async function (req, res) {
    const user = req.body;

    let existUser = await userModel.singleByUserName(
      req.accessTokenPayload.username
    );

    if (!bcrypt.compareSync(user.oldPassword, existUser.password)) {
      return successResponse(res, "Mật khẩu không chính xác", null, 400, false);
    }

    if (user.newPassword != user.rePassword) {
      return successResponse(res, "Mật khẩu không khớp", null, 400, false);
    }

    await userModel.changePassword(
      req.accessTokenPayload.username,
      bcrypt.hashSync(user.newPassword, 10)
    );

    return successResponse(res, "Cập nhật thành công");
  }
);

module.exports = router;
