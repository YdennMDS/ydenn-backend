module.exports = (server) => {
  const roomController = require("../controllers/roomController");
  const auth = require("../middlewares/authMiddleware");

  server.post("/room/createRoom", auth, roomController.createRoom);
  server.get("/room/getAllRooms", auth, roomController.getAllRooms);
  server.get("/room/getRoomById/:id", auth, roomController.getRoomById);
  server.post(
    "/room/registerToRoom/:roomId",
    auth,
    roomController.registerToRoom
  );
  server.post(
    "/room/unregisterFromRoom/:roomId",
    auth,
    roomController.unregisterFromRoom
  );
  server.get("/room/:roomId/isUserInRoom", auth, roomController.isUserInRoom);
  server.post("/rooms/:roomId/start", auth, roomController.startRoom);

  // Nouvelle route pour mettre à jour la date de démarrage
  server.patch(
    "/rooms/:roomId/start-time",
    auth,
    roomController.updateRoomStartTime
  );
};
