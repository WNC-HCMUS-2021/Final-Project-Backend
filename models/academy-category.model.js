const db = require("../utils/db");

const TABLE_NAME = "academy_category";
const PRIMARY_KEY = "academy_category_id";
const NOT_DELETE = 0;

require("dotenv").config();

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
    const listCategory = await db(TABLE_NAME).where("academy_parent_id", null);
    for (i in listCategory) {
      listCategory[i].child = await db(TABLE_NAME).where(
        "academy_parent_id",
        listCategory[i].academy_category_id
      );
    }

    if (listCategory.length <= 0) {
      return null;
    }
    return listCategory;
  },

  //get academy by categoryID
  async getAcademyByCategoryId(
    categoryId,
    page = 1,
    limit = process.env.LIMIT
  ) {
    const result = await db("academy")
      .where("academy_category_id", categoryId)
      .limit(limit)
      .offset((page - 1) * limit);
    if (result.length <= 0) {
      return null;
    }
    return result;
  },
};
