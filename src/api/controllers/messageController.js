const Message = require("../models/messageModel");
const Room = require("../models/roomModel");

exports.createMessage = async (req, res) => {
  try {
    console.log("[messageController] Création d'un nouveau message");
    const {
      message_content,
      message_room,
      message_isFiltered,
      message_filteredReason,
    } = req.body;

    console.log("[messageController] Contenu du message:", message_content);
    console.log("[messageController] Est filtré:", message_isFiltered);
    console.log(
      "[messageController] Raison du filtrage:",
      message_filteredReason
    );

    const room = await Room.findById(message_room);

    if (!room) {
      console.log("[messageController] Room introuvable:", message_room);
      return res.status(404).json({ error: "Room introuvable" });
    }

    // Le middleware de profanité a déjà nettoyé le contenu et défini les flags si nécessaire
    const newMessage = new Message({
      message_content,
      message_author: req.user.id,
      message_room,
      message_isFiltered: message_isFiltered || false,
      message_filteredReason: message_filteredReason || null,
    });

    await newMessage.save();
    console.log(
      "[messageController] Message enregistré avec succès:",
      newMessage._id
    );
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error(
      "[messageController] Erreur lors de la création du message:",
      error
    );
    res.status(500).json({ error: "Erreur lors de la création du message" });
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
