const Message = require("../models/messageModel");
const Room = require("../models/roomModel");
const leoProfanity = require("leo-profanity");

exports.createMessage = async (req, res) => {
  try {
    const { message_content, message_room } = req.body;

    const room = await Room.findById(message_room);

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

exports.getMessagesByRoomId = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({ message: "L'ID de la room est requis." });
  }

  try {
    const messages = await Message.find({ message_room: roomId })
      .sort({
        createdAt: 1,
      })
      .populate("message_author", "username");

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
