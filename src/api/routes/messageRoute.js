module.exports = (server) => {
  const messageController = require("../controllers/messageController");
  const auth = require("../middlewares/authMiddleware");
  const profanityMiddleware = require("../middlewares/profanityMiddleware");

  server.post(
    "/message/createMessage",
    auth,
    profanityMiddleware,
    messageController.createMessage
  );
  server.get(
    "/message/getMessagesByRoomId/:roomId",
    auth,
    messageController.getMessagesByRoomId
  );
};
