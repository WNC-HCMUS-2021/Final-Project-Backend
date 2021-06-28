const express = require('express');
const categoryModel = require('../../models/academy-category.model');
const academyModel = require('../../models/academy.model');
const schema = require('../../schema/academy-category.json');
const router = express.Router();

const { successResponse } = require('../../middlewares/success-response.mdw');

// lấy tất cả danh mục
router.get('/', async function (req, res) {
    const list = await categoryModel.all();
    successResponse(res, "Query data success", list);
})

// lấy chi tiết
router.get('/:id', async function (req, res) {
    const id = req.params.id || 0;
    const category = await categoryModel.single(id);
    successResponse(res, "Query data success", category);
})

// thêm danh mục
router.post('/', require('../../middlewares/validate.mdw')(schema), async function (req, res) {
    const category = req.body;
    const ids = await categoryModel.add(category);
    category.category_id = ids[0];
    successResponse(res, "Create data success", category, 201);
})

// cập nhật danh mục
router.patch('/:id', require('../../middlewares/validate.mdw')(schema), async function (req, res) {
    const id = req.params.id
    const category = req.body;
    const result = await categoryModel.edit(id, category);
    successResponse(res, "Update data success", result, 201);
})

// xoá danh mục: Không được xoá danh mục đã có khoá học
router.delete('/:id', async function (req, res) {
    const id = req.params.id;
    // kiểm trả xem danh mục có khoá học nào không
    const listAcademy = await academyModel.getAllByCategoryId(id);
    console.log("list academy", listAcademy);
    // xoá 
    if (listAcademy === null) {
        successResponse(res, "Danh muc khong ton tai", listAcademy, 404, false);
    }
    if (listAcademy.length <= 0) {
        const result = await categoryModel.delete(id);
        successResponse(res, "Delete data success", result, 200);
    } else {
        successResponse(res, "Ton tai khoa hoc trong danh muc nay", listAcademy, 400, false);
    }
})

module.exports = router;