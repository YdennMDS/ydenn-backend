const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let roomSchema = new Schema({
  // room_categorie: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Theme",
  // },
  // room_thematic: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Theme",
  // },
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
  created_at: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  room_isSponsored: {
    type: Boolean,
    default: false, // Par défaut, une room est classique
  },
  // Ajout d'un champ sponsor dans le cas d'une room sponsorisée
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
});

module.exports = mongoose.model("Room", roomSchema);
