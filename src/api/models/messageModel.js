const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let messageSchema = new Schema({
  message_content: {
    type: String,
    required: true,
  },
  message_author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message_room: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  message_date: {
    type: Date,
    default: Date.now,
  },
  message_isFiltered: {
    type: Boolean,
    default: false,
  },
  message_filteredReason: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Message", messageSchema);
