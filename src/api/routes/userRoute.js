module.exports = (server) => {
  const userController = require("../controllers/userController");

  server.post("/user/register", userController.userRegister);
};
