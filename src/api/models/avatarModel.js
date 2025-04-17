const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const avatarSchema = new Schema({
  avatar_name: {
    type: String,
    required: true,
    unique: true,
  },
  avatar_image: {
    type: String,
    required: true,
  },
  avatar_description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Avatar", avatarSchema);
