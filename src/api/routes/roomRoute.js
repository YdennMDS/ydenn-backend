module.exports = (server) => {
  const roomController = require("../controllers/roomController");
  const auth = require("../middlewares/authMiddleware");

  server.post("/room/createRoom", auth, roomController.createRoom);
  server.get("/room/getAllRooms", auth, roomController.getAllRooms);
  server.get("/room/getRoomById/:id", auth, roomController.getRoomById);
};
