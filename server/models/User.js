const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  avatar: String,
  friends: [String],
  createdAt: String,
});

module.exports = mongoose.model("User", UserSchema);
