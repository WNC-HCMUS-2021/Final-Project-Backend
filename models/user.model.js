const db = require("../utils/db");

const TABLE_NAME = "user";
const PRIMARY_KEY = "user_id";
const ADMIN = "admin";
const STUDENT = "student";
const TEACHER = "teacher";

module.exports = {
  async all() {
    return await db("user");
  },

  add(user) {
    return db("user").insert(user);
  },

  async getByEmail(email) {
    const users = await db("user").where("email", email);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async getByPhone(phone) {
    const users = await db("user").where("phone_number", phone);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async singleByUserName(username) {
    const users = await db("user").where("username", username);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  patchRFToken(id, rfToken) {
    return db("user").where("user_id", id).update("refresh_token", rfToken);
  },

  async isValidRFToken(id, rfToken) {
    const list = await db("user")
      .where("user_id", id)
      .andWhere("refresh_token", rfToken);
    if (list.length > 0) {
      return true;
    }

    return false;
  },

  async verifyEmail(userId) {
    return db("user").where("user_id", userId).update("is_verify", 1);
  },

  // ================================== TEACHER ====================================
  // lấy tất cả giáo viên
  async getAllTeacher() {
    return await db(TABLE_NAME).where("role", TEACHER);
  },

  // chi tiết giáo viên
  async getDetailTeacher(id) {
    const item = await db(TABLE_NAME)
      .where(PRIMARY_KEY, id)
      .where("role", TEACHER);

    if (item.length === 0) {
      return null;
    }
    return item[0];
  },

  // ================================ END TEACHER ==================================
};
