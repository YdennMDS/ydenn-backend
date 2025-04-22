module.exports = (server) => {
  const notificationController = require("../controllers/notificationController");
  const auth = require("../middlewares/authMiddleware");

  // Récupérer toutes les notifications de l'utilisateur connecté
  server.get("/notifications", auth, notificationController.getNotifications);

  // Marquer une notification comme lue
  server.patch(
    "/notifications/:notificationId/read",
    auth,
    notificationController.markAsRead
  );

  // Marquer toutes les notifications comme lues
  server.patch(
    "/notifications/read-all",
    auth,
    notificationController.markAllAsRead
  );
};
