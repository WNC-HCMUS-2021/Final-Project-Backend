const express = require('express');
const bcrypt = require("bcryptjs");
const userModel = require('../../models/user.model');
const schema = require('../../schema/teacher.json');
const router = express.Router();

const { successResponse } = require('../../middlewares/success-response.mdw');

// lấy tất cả giáo viên, học viên
router.get('/', async function (req, res) {
    // phân trang (page, limit), sắp xếp
    let page = req.query.page;
    const list = await userModel.getAllUser(page, req.query.limit, req.query.sort, req.query.role);
    const data = {
        data: list,
        page: page ? page : 1
    }
    successResponse(res, "Query data success", data);
})

// lấy chi tiết giáo viên, học viên
router.get('/:id', async function (req, res) {
    const id = req.params.id || 0;
    const user = await userModel.getDetailUser(id);
    if (user === null) {
        successResponse(res, 'No user exist', user, 404, false);
    }
    successResponse(res, 'Query data success', user);
})

// thêm giáo viên
router.post('/', require('../../middlewares/validate.mdw')(schema.create), async function (req, res) {
    const teacher = req.body;
    teacher.password = bcrypt.hashSync(teacher.password, 10);
    teacher.role = 'teacher';

    const ids = await userModel.addTeacher(teacher);
    teacher.id = ids[0];
    delete teacher.password;

    successResponse(res, 'Create data success', teacher, 201);
});

// chỉnh sửa giáo viên
router.put('/', require('../../middlewares/validate.mdw')(schema.update), async function (req, res) {
    const user = req.body;
    // check xem body có username, email, password hay không
    delete user.password; delete user.username; delete user.email;
    const result = await userModel.editTeacherById(req.body.user_id, user);

    successResponse(res, 'Update data success', result);
});

// thay đổi mật khẩu
router.put('/change-password', require('../../middlewares/validate.mdw')(schema.changePW), async function (req, res) {
    const user = req.body;
    // check password vs confirm password
    if (user.password !== user.confirm_password) {
        successResponse(res, 'Confirm password is not match', null, 400, false);
    }
    user.password = bcrypt.hashSync(user.password, 10);
    // update
    console.log(user);
    const result = await userModel.changePasswordUser(req.body.user_id, user.password);

    successResponse(res, 'Change password success', result);
});

// xoá giáo viên
router.delete('/:id', async function (req, res) {
    const id = req.params.id;
    const result = await userModel.deleteUser(id);
    successResponse(res, "Delete data success", result, 200);
})

module.exports = router;