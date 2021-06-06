const db = require("../utils/db");

module.exports = {
  async all() {
    return await db("user");
  },

  add(user) {
    return db("user").insert(user);
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
};
