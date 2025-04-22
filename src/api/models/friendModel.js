const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendSchema = new Schema(
  {
    friend_requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friend_recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friend_status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index pour éviter les doublons et accélérer les recherches
friendSchema.index(
  { friend_requester: 1, friend_recipient: 1 },
  { unique: true }
);

module.exports = mongoose.model("Friend", friendSchema);
