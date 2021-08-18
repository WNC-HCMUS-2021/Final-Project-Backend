const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require('../../models/user.model');
const randomstring = require("randomstring");

const router = express.Router();
const { successResponse } = require("../../middlewares/success-response.mdw");

const TIME_EXPIRED_TOKEN = 10 * 60;


router.post("/", async function (req, res) {
    const user = await userModel.singleByUserName(req.body.username);

    if (user === null) {
        return successResponse(res, "Username không tồn tại", null, 400, false);
    } else {
        if (user.role === 'student') {
            return successResponse(res, "Tên tài khoản hoặc mật khẩu không đúng", null, 400, false);
        }
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
        return successResponse(res, "Mật khẩu không đúng", null, 400, false);
    }

    const payload = {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerify: user.is_verify,
    };
    const opts = {
        expiresIn: TIME_EXPIRED_TOKEN, // seconds
    };
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, opts);

    const refreshToken = randomstring.generate(80);
    await userModel.patchRFToken(user.user_id, refreshToken);
    return successResponse(res, "Success", { accessToken, refreshToken });
});


router.post("/refresh", async function (req, res) {
    const { accessToken, refreshToken } = req.body;

    const user = jwt.verify(accessToken, process.env.SECRET_KEY, {
        ignoreExpiration: true,
    });

    const ret = await userModel.isValidRFToken(user.userId, refreshToken);
    if (ret === true) {
        const newAccessToken = jwt.sign(
            {
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
                isVerify: user.isVerify,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: TIME_EXPIRED_TOKEN,
            }
        );
        return successResponse(res, "Success", { accessToken: newAccessToken });
    }
    return successResponse(res, "Refresh token is revoked!", null, 400, false);
});

module.exports = router;