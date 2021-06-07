const db = require("../utils/db");

const TABLE_NAME = 'academy';
const PRIMARY_KEY = 'academy_id';

module.exports = {
  // get all
  async all() {
    return await db(TABLE_NAME);
  },

  // get one
  async single(id) {
    const item = await db(TABLE_NAME)
      .where(PRIMARY_KEY, id);

    if (item.length === 0) {
      return null;
    }
    return item[0];
  },

  // get all by category id
  async getAllByCategoryId(categoryId) {
    const result = await db(TABLE_NAME).where('academy_category_id', categoryId);
    if (result.length <= 0) {
      return null;
    }
    return result;
  },

  // delete
  delete(id) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ is_delete: 1 });
  },
};
