const db = require("../utils/db");

const TABLE_NAME = "academy";
const PRIMARY_KEY = "academy_id";
const NOT_DELETE = 0;
const LIMIT = process.env.LIMIT;
const SORT_TYPE = "ASC";

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

  //get outline
  async getOutline(academy_id) {
    const list = await db("academy_outline").where("academy_id", academy_id);

    if (list.length === 0) {
      return null;
    }

    return list;
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

  top4Highlight() {
    const now = new Date();
    const temp = new Date();
    temp.setDate(temp.getDate() - 7);

    return db("academy_register_like as r")
      .join(TABLE_NAME + " as a", "a.academy_id", "=", "r.academy_id")
      .select("a.*")
      .where("a.created_at", "<", now)
      .where("a.created_at", ">", temp)
      .where("r.is_register", 1)
      .count("r.academy_id as register")
      .groupBy("a.academy_id")
      .orderBy("register", "desc")
      .limit(4);
  },

  top10View() {
    return db(TABLE_NAME).orderBy("view", "desc").limit(10);
  },

  top10Latest() {
    return db(TABLE_NAME).orderBy("created_at", "desc").limit(10);
  },

  search(keyword, rate, price, page = 1, limit = process.env.LIMIT) {
    if (rate && (rate == "desc" || rate == "asc")) {
      return db.raw(
        `SELECT * FROM academy as a where MATCH(academy_name) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE) > 0 ORDER BY a.rate ${rate} LIMIT ${limit} OFFSET ${
          (page - 1) * limit
        } `
      );
    }

    if (price && (price == "desc" || price == "asc")) {
      return db.raw(
        `SELECT * FROM academy as a where MATCH(academy_name) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE) > 0 ORDER BY a.price ${price} LIMIT ${limit} OFFSET ${
          (page - 1) * limit
        } `
      );
    }

    return db.raw(
      `SELECT * FROM academy as a where MATCH(academy_name) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE) > 0 ORDER BY a.rate desc LIMIT ${limit} OFFSET ${
        (page - 1) * limit
      } `
    );
  },

  getAll(rate, price, page = 1, limit = process.env.LIMIT) {
    if (rate && (rate == "desc" || rate == "asc")) {
      return db(TABLE_NAME)
        .orderBy("rate", rate)
        .limit(limit)
        .offset((page - 1) * limit);
    }

    if (price && (price == "desc" || price == "asc")) {
      return db(TABLE_NAME)
        .orderBy("price", price)
        .limit(limit)
        .offset((page - 1) * limit);
    }

    return db(TABLE_NAME)
      .orderBy("rate", "desc")
      .limit(limit)
      .offset((page - 1) * limit);
  },

  getWatchList(userId) {
    return db("academy_register_like as r")
      .where("r.student_id", userId)
      .where("is_like", 1)
      .join(TABLE_NAME + " as a", "a.academy_id", "=", "r.academy_id")
      .select("a.*");
  },

  getAcademyByUserId(userId) {
    return db("academy_register_like as r")
      .where("r.student_id", userId)
      .where("is_register", 1)
      .join(TABLE_NAME + " as a", "a.academy_id", "=", "r.academy_id")
      .select("a.*");
  },

  async addToWatchList(userId, academyId) {
    let result = await this.single(academyId);
    if (result) {
      return db("academy_register_like").insert({
        student_id: userId,
        academy_id: academyId,
        is_like: 1,
      });
    }
    return null;
  },

  async deleteWatchList(userId, academyId) {
    let result = await this.single(academyId);
    if (result) {
      return db("academy_register_like")
        .where({
          student_id: userId,
          academy_id: academyId,
          is_like: 1,
        })
        .delete();
    }
    return null;
  },

  async addView(academy_id) {
    let academy = await db("academy")
      .where("academy_id", academy_id)
      .where("is_delete", 0)
      .first();
    if (!academy) {
      return academy;
    }

    await db("academy")
      .where("academy_id", academy_id)
      .update({ view: academy.view + 1 });
    return true;
  },

  async rateAcademy(userId, rate) {
    let existAcademy = await this.single(rate.academy_id);
    if (!existAcademy) {
      return false;
    }

    let isRateAcademy = await db("academy_rate")
      .where("student_id", userId)
      .where("academy_id", rate.academy_id);

    if (isRateAcademy.length !== 0) {
      return false;
    }

    var t = await db.transaction();
    try {
      let isRegisterAcademy = await db("academy_register_like")
        .where("student_id", userId)
        .where("academy_id", rate.academy_id)
        .where("is_register", 1);

      if (isRegisterAcademy.length == 0) {
        return false;
      }

      await db("academy_rate").insert({
        student_id: userId,
        academy_id: rate.academy_id,
        point: rate.point,
        comment: rate.comment,
      });

      let academyRate = await db("academy_rate").where(
        "academy_id",
        rate.academy_id
      );
      var point = 0;
      for (let i = 0; i < academyRate.length; i++) {
        point += academyRate[i].point;
      }

      point = point / academyRate.length;

      await db("academy")
        .where("academy_id", rate.academy_id)
        .update("rate", point);

      t.commit();
      return true;
    } catch (error) {
      console.log(error);
      t.rollback();
    }
  },

  async getRateAcademy(academy_id) {
    const listRate = await db("academy_rate").where("academy_id", academy_id);

    if (listRate.length <= 0) {
      return null;
    }
    return listRate;
  },

  async related(academy_id) {
    let existAcademy = await this.single(academy_id);
    if (!existAcademy) {
      return false;
    }

    return db("academy_register_like as r")
      .join(TABLE_NAME + " as a", "a.academy_id", "=", "r.academy_id")
      .select("a.*")
      .where("a.academy_id", "!=", existAcademy.academy_id)
      .where("a.academy_category_id", existAcademy.academy_category_id)
      .count("r.academy_id as register")
      .groupBy("a.academy_id")
      .orderBy("register", "desc")
      .limit(5);
  },
};
