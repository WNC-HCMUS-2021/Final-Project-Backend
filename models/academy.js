const db = require("../utils/db");

module.exports = {
  async all() {
    return await db("academy");
  },
};
