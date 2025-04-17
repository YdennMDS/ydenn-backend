const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const themeSchema = new Schema({
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
  theme_rooms: [
    {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  theme_createdAt: {
    type: Date,
    default: Date.now,
  },
  theme_updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Theme", themeSchema);
