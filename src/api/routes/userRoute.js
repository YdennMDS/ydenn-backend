module.exports = (server) => {
  const userController = require("../controllers/userController");

  server.post("/user/register", userController.userRegister);
  server.post("/user/login", userController.userLogin);
  server.get("/user/confirm/:token", userController.confirmEmail);
};
