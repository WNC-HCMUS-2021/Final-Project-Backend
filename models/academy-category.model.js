const db = require("../utils/db");

const TABLE_NAME = "academy_category";
const PRIMARY_KEY = "academy_category_id";
const NOT_DELETE = 0;

module.exports = {
  // get all
  async all() {
    const listCategory = await db(TABLE_NAME)
      .join("user", `${TABLE_NAME}.created_by`, "=", "user.user_id")
      .where(`${TABLE_NAME}.is_delete`, NOT_DELETE)
      .select(`${TABLE_NAME}.*`, "user.name as creator_name");

    if (listCategory.length <= 0) {
      return null;
    }
    return listCategory;
  },
  // get one
  async single(id) {
    const item = await db(TABLE_NAME)
      .join("user", `${TABLE_NAME}.created_by`, "=", "user.user_id")
      .where(`${TABLE_NAME}.is_delete`, NOT_DELETE)
      .where(PRIMARY_KEY, id)
      .select(`${TABLE_NAME}.*`, "user.name as creator_name");

    if (item.length === 0) {
      return null;
    }
    return item[0];
  },
  // add
  add(category) {
    return db(TABLE_NAME).insert(category);
  },
  // edit
  edit(id, category) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update(category);
  },
  // delete
  delete(id) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ is_delete: 1 });
  },

  //get all
  async getAll() {
    const listCategory = await db(TABLE_NAME + " as p")
      .select("*")
      .leftJoin(
        TABLE_NAME + " as c",
        "p.academy_category_id",
        "c.academy_parent_id"
      )
      .where("p.academy_parent_id", null);

    if (listCategory.length <= 0) {
      return null;
    }
    return listCategory;
  },
};
