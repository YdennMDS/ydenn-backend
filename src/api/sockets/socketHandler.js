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

      // Récupérer l'utilisateur à partir du socket (ex: via un token JWT si tu en as un)
      const username = socket.handshake.auth?.username || "Anonyme";

      const newMessage = {
        message_author: { username },
        message_content: message,
        message_room: roomId,
        message_date: new Date().toISOString(),
      };

      io.to(roomId).emit("receiveMessage", newMessage);
      console.log(`Message envoyé dans la room ${roomId}:`, message);
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
