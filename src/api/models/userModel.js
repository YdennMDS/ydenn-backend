const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  user_email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
  user_password: {
    type: String,
    required: "Le contenu est requis",
  },
  user_firstName: {
    type: String,
    required: "Le contenu est requis",
  },
  user_birth_date: {
    type: Date,
    required: "Le contenu est requis",
  },
  confirmationToken: String,
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  user_register_date: {
    type: Date,
    default: Date.now,
  },
  resetPasswordCode: String,
  resetPasswordCodeExpires: Date,
  isCodeVerified: {
    type: Boolean,
    default: false,
  },
  userFavoritesThemes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Theme",
    },
  ],
  userAvatar: {
    type: Schema.Types.ObjectId,
    ref: "Avatar",
    default: null,
  },
  expoPushToken: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("User", userSchema);
