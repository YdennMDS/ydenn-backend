module.exports = (server) => {
  const userController = require("../controllers/userController");

  server.post("/user/register", userController.userRegister);
  server.get("/user/confirm/:token", userController.confirmEmail);
};
