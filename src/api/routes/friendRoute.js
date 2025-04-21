module.exports = (server) => {
  const friendController = require("../controllers/friendController");
  const auth = require("../middlewares/authMiddleware");

  // Envoyer une demande d'ami
  server.post("/friend/request", auth, friendController.sendFriendRequest);

  // Accepter une demande d'ami
  server.put(
    "/friend/accept/:friendId",
    auth,
    friendController.acceptFriendRequest
  );

  // Rejeter une demande d'ami
  server.put(
    "/friend/reject/:friendId",
    auth,
    friendController.rejectFriendRequest
  );

  // Supprimer un ami
  server.delete(
    "/friend/remove/:friendId",
    auth,
    friendController.removeFriend
  );

  // Obtenir la liste des amis
  server.get("/friend/friends", auth, friendController.getFriendsList);

  // Obtenir les demandes d'ami en attente
  server.get("/friend/pending", auth, friendController.getPendingRequests);
};
