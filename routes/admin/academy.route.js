const express = require('express');
const router = express.Router();
const academyModel = require('../../models/academy.model');
const academyOutlineModel = require('../../models/academy-outline.model');
const userModel = require('../../models/user.model');
const schemaAcademy = require('../../schema/academy.json');
const schemaOutline = require('../../schema/academy-outline.json');
const { successResponse } = require('../../middlewares/success-response.mdw');

const ROLE_TEACHER = 'teacher';

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
router.post('/', require('../../middlewares/validate.mdw')(schemaAcademy.create), async function (req, res) {
  let academy = req.body;
  // check user_id phải có role là giáo viên
  let user_id = academy.teacher_id;
  let user = await userModel.getDetailUser(user_id);

  if (user.role !== ROLE_TEACHER) {
    successResponse(res, 'No permission', null, 403, false);
  }

  // thêm khoá học
  academy.created_at = new Date(req.body.created_at);
  const ids = await academyModel.add(academy); // thêm khoá học
  academy.academy_id = ids[0];
  successResponse(res, "Create data success", academy, 201);
});

// Giáo viên cập nhật khoá học
router.patch('/:id', require('../../middlewares/validate.mdw')(schemaAcademy.update), async function (req, res) {
  const id = req.params.id
  let academy = req.body;
  // check user_id phải có role là giáo viên
  let user_id = academy.teacher_id;
  let user = await userModel.getDetailUser(user_id);

  if (user.role !== ROLE_TEACHER) {
    successResponse(res, 'No permission', null, 403, false);
  }

  // update thông tin khoá học
  delete academy.created_at;
  const result = await academyModel.edit(id, academy); // thêm khoá học
  successResponse(res, "Update data success", result, 200);
})

// Giáo viên thêm chi tiết nội dung khoá học
router.post('/:academyId/outline', require('../../middlewares/validate.mdw')(schemaOutline.create), async function (req, res) {
  let outline = req.body;
  outline.academy_id = req.params.academyId;
  // check tồn tại academy

  // insert
  outline.created_at = new Date(req.body.created_at);
  const ids = await academyOutlineModel.add(outline); // thêm khoá học
  outline.academy_outline_id = ids[0];
  successResponse(res, "Create data success", outline, 201);
});

// Giáo viên cập nhật chi tiết nội dung khoá học
router.patch('/:academyId/outline/:id', require('../../middlewares/validate.mdw')(schemaOutline.update), async function (req, res) {
  const id = req.params.id;
  let outline = req.body;
  outline.academy_id = req.params.academyId;

  // update
  delete outline.created_at;
  const result = await academyOutlineModel.edit(id, outline); // cập nhật nội dung khoá học
  successResponse(res, "Update data success", result, 200);
})

module.exports = router;
