const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  room_categorie: {
    type: Schema.Types.ObjectId,
    ref: "Categorie",
  },
  room_thematic: {
    type: Schema.Types.ObjectId,
    ref: "Theme",
  },
  room_duration: {
    type: Number,
    required: true,
  },
  room_start_time: {
    type: Date,
    required: true,
  },
  room_type: {
    type: String,
    enum: ["public", "private"],
    required: true,
  },
  room_created_at: {
    type: Date,
    default: Date.now,
  },
  room_updatedAt: {
    type: Date,
    default: Date.now,
  },
  room_isSponsored: {
    type: Boolean,
    default: false,
  },
  room_sponsor_name: {
    type: String,
    required: function () {
      return this.isSponsored;
    },
  },
  room_owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  room_participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  room_max_participants: {
    type: Number,
    default: 10,
    required: true,
  },
});

module.exports = mongoose.model("Room", roomSchema);
