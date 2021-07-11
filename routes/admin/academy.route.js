const express = require('express');
const academyModel = require('../../models/academy.model');
const router = express.Router();
const schema = require('../../schema/academy.json');
const { successResponse } = require('../../middlewares/success-response.mdw');
const userModel = require('../../models/user.model');

// Lấy tất cả khoá học
router.get('/', async function (req, res) {
  // phân trang (page, limit), sắp xếp
  let page = req.query.page;
  let limit = req.query.limit;
  let sort = req.query.sort;
  const list = await academyModel.all(page, limit, sort);
  const data = {
    data: list,
    page: page ? page : 1
  }
  successResponse(res, "Query data success", data);
});

// Gỡ bỏ khoá học
router.delete('/:id', async function (req, res) {
  const id = req.params.id;
  // check tồn tại khoá học
  const academy = await academyModel.single(id);
  if (academy === null) {
    successResponse(res, 'No academy exist', academy, 404, false);
  }
  // xoá 
  const result = await academyModel.delete(id);
  successResponse(res, 'Delete data success', result);
})

// Giáo viên thêm khoá học mới
router.post('/', require('../../middlewares/validate.mdw')(schema.create), async function (req, res) {
  let academy = req.body;
  // check user_id phải có role là giáo viên
  let user_id = academy.teacher_id;
  let user = userModel.getDetailUser(user_id);
  if (user.role !== 'teacher') {
    successResponse(res, 'No permission', null, 403, false);
  }

  // thêm khoá học
  academy.created_at = new Date(req.body.created_at);
  const ids = await academyModel.add(category); // thêm khoá học
  academy.academy_id = ids[0];

  // thêm chi tiết nội dung khoá học
  successResponse(res, "Create data success", academy, 201);
});

// Giáo viên cập nhật khoá học
router.patch('/:id', require('../../middlewares/validate.mdw')(schema.update), async function (req, res) {
  const id = req.params.id
  // check user_id phải có role là giáo viên

  // update thông tin khoá học

  // update nội dung khoá học

  successResponse(res, "Update data success", result, 200);
})

module.exports = router;
