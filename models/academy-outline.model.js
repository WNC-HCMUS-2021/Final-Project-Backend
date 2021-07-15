const db = require("../utils/db");

const TABLE_NAME = "academy_outline";
const PRIMARY_KEY = "academy_outline_id";

module.exports = {

    add(data) {
        return db(TABLE_NAME).insert(data);
    },

    // edit
    edit(id, data) {
        return db(TABLE_NAME).where(PRIMARY_KEY, id).update(data);
    },


}