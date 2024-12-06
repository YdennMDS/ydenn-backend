const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let categorieSchema = new Schema({
  categorie_name: {
    type: String,
    required: true,
    unique: true,
  },
  categorie_description: {
    type: String,
    required: true,
  },
  categorie_theme: [
    {
      type: Schema.Types.ObjectId,
      ref: "Theme",
    },
  ],
  categorie_image: {
    type: String,
    required: true,
  },
  categorie_createdAt: {
    type: Date,
    default: Date.now,
  },
  categorie_updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Categorie", categorieSchema);
