const express = require('express');
const categoryModel = require('../models/category.model');
const schema = require('../schemas/category.json');
const router = express.Router();

router.get('/', async function (req, res) {
    const list = await categoryModel.all();
    res.json(list);
})

router.get('/:id', async function (req, res) {
    const id = req.params.id || 0;
    const category = await categoryModel.single(id);
    if (category === null) {
      return res.status(204).end();
    }
    res.json(category);
})

router.post('/', require('../middlewares/validate.mdw')(schema), async function (req, res) {
    const category = req.body;
    const ids = await categoryModel.add(category);
    category.category_id = ids[0];
    res.status(201).json(category);
})

router.patch('/:id', require('../middlewares/validate.mdw')(schema), async function (req, res) {
    const id = req.params.id
    const category = req.body;
    const result = await categoryModel.edit(id, category);
    res.status(200).json(result);
})
  
router.delete('/:id', async function (req, res) {
    const id = req.params.id;
    const result = await categoryModel.delete(id);
    res.status(200).json(result);
})

module.exports = router;