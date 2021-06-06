const db = require("../utils/db");

module.exports = {
  // get all
  all() {
    return db('academy_category');
  },
  // get one
  async single(id) {
    const categories = await db('academy_category').where('academy_category_id', id);
    if (categories.length === 0) {
      return null;
    }
    return categories[0];
  },
  // add
  add(category) {
    return db('academy_category').insert(category);
  },
  // edit
  edit(id, category) {
    return db('academy_category').where('academy_category_id', id).update(category);
  },
  // delete
  delete(id) {
    return db('academy_category').where('academy_category_id', id).del();
  },
};
