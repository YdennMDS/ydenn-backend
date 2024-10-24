module.exports = (server) => {
  const roomController = require("../controllers/roomController");
  const auth = require("../middlewares/authMiddleware");

  server.post("/room/createRoom", auth, roomController.createRoom);
};
