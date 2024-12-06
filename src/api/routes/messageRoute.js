module.exports = (server) => {
  const messageController = require("../controllers/messageController");
  const auth = require("../middlewares/authMiddleware");

  server.post("/message/createMessage", auth, messageController.createMessage);
  server.get(
    "/message/getMessagesByRoomId/:roomId",
    auth,
    messageController.getMessagesByRoomId
  );
};
