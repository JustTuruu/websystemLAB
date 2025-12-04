const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  rating: Number,
  image: String,
  userId: String,
  createdAt: String,
});

module.exports = mongoose.model("Place", PlaceSchema);
