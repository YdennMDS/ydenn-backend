const Message = require("../models/messageModel");
const Room = require("../models/roomModel");
const leoProfanity = require("leo-profanity");

exports.createMessage = async (req, res) => {
  try {
    const { message_content, message_room } = req.body;

    const room = await Room.findById(message_room);
    // const room = "6717a92a6fc6f10596a798ed";

    if (!room) {
      return res.status(404).json({ error: "Room introuvable" });
    }

    if (leoProfanity.check(message_content)) {
      message_isFiltered = true;
      message_filteredReason = "Contenu inapproprié";
    }

    const cleanMessageContent = leoProfanity.clean(message_content);

    const newMessage = new Message({
      message_content: cleanMessageContent,
      message_author: req.user.id,
      message_room,
      // message_room: "6717a92a6fc6f10596a798ed",
    });

    await newMessage.save();
    res
      .status(201)
      .json({ message: "Message créé avec succès", message: newMessage });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du message" });
    console.error(error);
  }
};
