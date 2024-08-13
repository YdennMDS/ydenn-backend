module.exports = (server) => {
  const avatarController = require("../controllers/avatarController");

  server.post("/avatar/createAvatar", avatarController.createAvatar);
};
