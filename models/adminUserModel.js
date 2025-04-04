const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const AdminUserSchema = new Schema({
  username: String,
  password: String,
});

module.exports = mongoose.model("AdminUsers", AdminUserSchema);
