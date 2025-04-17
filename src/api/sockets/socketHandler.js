const profanityFilter = require("../utils/profanityFilter");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Un utilisateur s'est connecté :", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Utilisateur ${socket.id} a rejoint la room ${roomId}`);
    });

    socket.on("sendMessage", (data) => {
      const { roomId, message } = data;

      if (!roomId || !message) return;

      // Récupérer l'utilisateur à partir du socket
      const username = socket.handshake.auth?.username || "Anonyme";

      // Vérifier si le message contient des mots inappropriés
      const containsProfanity = profanityFilter.containsProfanity(message);

      // Préparer le message (filtré ou non)
      let messageContent = message;
      let isFiltered = false;
      let filteredReason = null;

      if (containsProfanity) {
        // Récupérer la liste des mots inappropriés
        const profanityWords = profanityFilter.getProfanityList(message);

        // Nettoyer le message
        messageContent = profanityFilter.cleanMessage(message);

        // Marquer le message comme filtré
        isFiltered = true;

        // Indiquer la raison du filtrage
        filteredReason = `Contenu inapproprié: ${profanityWords.join(", ")}`;

        console.log(`Message filtré: "${message}" -> "${messageContent}"`);
      }

      // Créer l'objet message (avec le contenu filtré si nécessaire)
      const newMessage = {
        message_author: { username },
        message_content: messageContent,
        message_room: roomId,
        message_date: new Date().toISOString(),
        message_isFiltered: isFiltered,
        message_filteredReason: filteredReason,
      };

      // Envoyer le message filtré à tous les clients dans la room
      io.to(roomId).emit("receiveMessage", newMessage);
      console.log(`Message envoyé dans la room ${roomId}:`, messageContent);
    });

    // Gestion des erreurs de connexion
    socket.on("connect_error", (err) => {
      console.error("Erreur de connexion WebSocket :", err.message);
    });

    socket.on("disconnect", () => {
      console.log("Un utilisateur s'est déconnecté :", socket.id);
    });
  });
};
