const express = require('express');
const academyModel = require('../../models/academy.model');
const router = express.Router();

const { successResponse } = require('../../middlewares/success-response.mdw');

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


module.exports = router;
