const express = require('express');
const bcrypt = require("bcryptjs");
const userModel = require('../../models/user.model');
const schema = require('../../schema/teacher.json');
const router = express.Router();

const { successResponse } = require('../../middlewares/success-response.mdw');

// lấy tất cả giáo viên
router.get('/', async function (req, res) {
    const list = await userModel.getAllTeacher();
    successResponse(res, 'Query data success', list);
})

// lấy chi tiết giao viên
router.get('/:id', async function (req, res) {
    const id = req.params.id || 0;
    const teacher = await userModel.getDetailTeacher(id);
    if (teacher === null) {
        successResponse(res, 'Khong tim thay giao vien', teacher, 404, false);
    }
    successResponse(res, 'Query data success', teacher);
})

// thêm giáo viên
router.post('/', require('../../middlewares/validate.mdw')(schema), async function (req, res) {
    const teacher = req.body;
    teacher.password = bcrypt.hashSync(teacher.password, 10);

    const ids = await userModel.add(teacher);
    teacher.id = ids[0];
    delete teacher.password;

    successResponse(res, 'Create data success', teacher, 201);
}
);

// chỉnh sửa giáo viên


// xoá giáo viên

module.exports = router;