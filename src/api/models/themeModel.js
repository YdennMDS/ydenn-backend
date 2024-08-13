const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let themeSchema = new Schema({
  theme_name: {
    type: String,
    required: true,
    unique: true,
  },
  theme_description: {
    type: String,
    required: true,
  },
  theme_image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Theme", themeSchema);
