module.exports = (server) => {
  const userController = require("../controllers/userController");
  const auth = require("../middlewares/authMiddleware");

  server.post("/user/register", userController.userRegister);
  server.post("/user/login", userController.userLogin);
  server.get("/user/confirm/:token", userController.confirmEmail);

  server.post(
    "/user/reset-password-request",
    userController.generateResetPasswordToken
  );
  server.post(
    "/user/verify-reset-code",
    userController.verifyResetPasswordCode
  );
  server.post("/user/reset-password", userController.resetPassword);

  server.post(
    "/user/favorites-themes",
    auth,
    userController.updateFavoritesThemes
  );

  server.post("/user/update-avatar", auth, userController.updateAvatar);

  server.post("/user/generate-username", auth, userController.generateUsername);
};
