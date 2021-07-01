const db = require("../utils/db");

const TABLE_NAME = "academy";
const PRIMARY_KEY = "academy_id";
const NOT_DELETE = 0;
const LIMIT = process.env.LIMIT;
const SORT_TYPE = "ASC"

module.exports = {
  // get all by filter
  async all(page = 1, limit = LIMIT, sort = SORT_TYPE) {
    const listAcademy = await db(TABLE_NAME)
      .where(`is_delete`, NOT_DELETE)
      .orderBy(`${PRIMARY_KEY}`, sort)
      .limit(limit)
      .offset((page - 1) * limit);

    if (listAcademy.length <= 0) {
      return null;
    }
    return listAcademy;
  },

  // get one
  async single(id) {
    const item = await db(TABLE_NAME).where(PRIMARY_KEY, id);

    if (item.length === 0) {
      return null;
    }
    return item[0];
  },

  // get all by category id
  async getAllByCategoryId(categoryId) {
    const result = await db(TABLE_NAME).where(
      "academy_category_id",
      categoryId
    );
    if (result.length <= 0) {
      return null;
    }
    return result;
  },

  // delete
  delete(id) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ is_delete: 1 });
  },

  top3Highlight() {
    const now = new Date();
    const temp = new Date();
    temp.setDate(temp.getDate() - 7);

    return db("academy_register_like as r")
      .join(TABLE_NAME + " as a", "a.academy_id", "=", "r.academy_id")
      .select("a.*")
      .where("a.created_at", "<", now)
      .where("a.created_at", ">", temp)
      .count("r.academy_id as register")
      .groupBy("a.academy_id")
      .orderBy("register", "desc")
      .limit(3);
  },

  top10View() {
    return db(TABLE_NAME).orderBy("view", "desc").limit(10);
  },

  top10Latest() {
    return db(TABLE_NAME).orderBy("created_at", "desc").limit(10);
  },

  search(keyword, orderby = "desc", page = 1, limit = process.env.LIMIT) {
    return db.raw(
      `SELECT * FROM academy as a where MATCH(academy_name) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE) > 0 ORDER BY a.rate ${orderby} LIMIT ${limit} OFFSET ${(page - 1) * limit
      } `
    );
  },
};
