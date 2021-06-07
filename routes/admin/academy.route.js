const express = require('express');
const academyModel = require('../../models/academy.model');
const router = express.Router();

const { templateResponse } = require('../../middlewares/tpl-response.mdw');

// Lấy tất cả khoá học
router.get('/', async function (req, res) {
  const list = await academyModel.all();
  res.json(list);
});

// Gỡ bỏ khoá học
router.delete('/:id', async function (req, res) {
  const id = req.params.id;
  // check tồn tại khoá học
  const academy = await academyModel.single(id);
  if (academy === null) {
    templateResponse(res, 'Khong ton tai khoa hoc', academy, 404, false);
  }
  // xoá 
  const result = await academyModel.delete(id);
  templateResponse(res, 'Delete data success', result);
})


module.exports = router;
