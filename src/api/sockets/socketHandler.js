const profanityFilter = require("../utils/profanityFilter");

// Map pour stocker les utilisateurs connectés
const connectedUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Un utilisateur s'est connecté :", socket.id);

    // Associer l'ID utilisateur à l'ID socket
    socket.on("register", (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`Utilisateur ${userId} enregistré avec socket ${socket.id}`);
    });

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

    // Fonctions pour les notifications
    socket.on("disconnect", () => {
      // Supprimer l'utilisateur de la map des utilisateurs connectés
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`Utilisateur ${userId} déconnecté`);
          break;
        }
      }
      console.log("Un utilisateur s'est déconnecté :", socket.id);
    });
  });

  // Fonctions pour envoyer des notifications
  return {
    // Envoyer une notification à un utilisateur spécifique
    sendNotification: (userId, notification) => {
      const socketId = connectedUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("notification", notification);
      }
    },

    // Envoyer une notification à plusieurs utilisateurs
    sendNotificationToMany: (userIds, notification) => {
      userIds.forEach((userId) => {
        const socketId = connectedUsers.get(userId);
        if (socketId) {
          io.to(socketId).emit("notification", notification);
        }
      });
    },
  };
};
