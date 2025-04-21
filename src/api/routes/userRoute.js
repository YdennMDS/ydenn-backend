module.exports = (server) => {
  const userController = require("../controllers/userController");
  const auth = require("../middlewares/authMiddleware");

  /**
   * @openapi
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       required:
   *         - user_email
   *         - user_password
   *         - user_firstName
   *         - user_birth_date
   *       properties:
   *         user_email:
   *           type: string
   *           description: L'adresse email de l'utilisateur (doit être unique)
   *           example: "johndoe@example.com"
   *         user_password:
   *           type: string
   *           description: Le mot de passe de l'utilisateur (au moins 6 caractères, incluant un chiffre)
   *           example: "Password123"
   *         user_firstName:
   *           type: string
   *           description: Le prénom de l'utilisateur
   *           example: "John"
   *         user_birth_date:
   *           type: string
   *           format: date
   *           description: La date de naissance de l'utilisateur
   *           example: "1990-01-01"
   *         user_register_date:
   *           type: string
   *           format: date-time
   *           description: Date d'inscription de l'utilisateur
   *           example: "2024-09-05T12:34:56Z"
   *         userFavoritesThemes:
   *           type: array
   *           items:
   *             type: string
   *           description: Liste des thèmes favoris de l'utilisateur
   *         userAvatar:
   *           type: string
   *           description: ID de l'avatar associé à l'utilisateur
   */

  /**
   * @swagger
   * /user/register:
   *   post:
   *     summary: Inscription d'un nouvel utilisateur
   *     tags: [Utilisateurs]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       201:
   *         description: Utilisateur inscrit avec succès
   *       400:
   *         description: Requête invalide (ex. email déjà utilisé)
   *       500:
   *         description: Erreur serveur
   */
  server.post("/user/register", userController.userRegister);

  /**
   * @swagger
   * /user/login:
   *   post:
   *     summary: Connexion d'un utilisateur
   *     tags: [Utilisateurs]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               user_email:
   *                 type: string
   *                 description: L'email de l'utilisateur
   *                 example: "johndoe@example.com"
   *               user_password:
   *                 type: string
   *                 description: Le mot de passe de l'utilisateur
   *                 example: "Password123"
   *     responses:
   *       200:
   *         description: Connexion réussie
   *       401:
   *         description: Email ou mot de passe incorrect
   *       500:
   *         description: Erreur serveur
   */
  server.post("/user/login", userController.userLogin);

  /**
   * @swagger
   * /user/confirm/{token}:
   *   get:
   *     summary: Confirme l'email d'un utilisateur
   *     tags: [Utilisateurs]
   *     parameters:
   *       - in: path
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Jeton de confirmation
   *     responses:
   *       200:
   *         description: Email confirmé
   *       400:
   *         description: Jeton de confirmation invalide
   *       500:
   *         description: Erreur serveur
   */
  server.get("/user/confirm/:token", userController.confirmEmail);

  /**
   * @swagger
   * /user/reset-password-request:
   *   post:
   *     summary: Demande de réinitialisation de mot de passe
   *     tags: [Utilisateurs]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               user_email:
   *                 type: string
   *                 description: Email de l'utilisateur
   *                 example: "johndoe@example.com"
   *     responses:
   *       200:
   *         description: Code de réinitialisation envoyé
   *       404:
   *         description: Utilisateur non trouvé
   *       500:
   *         description: Erreur serveur
   */
  server.post(
    "/user/reset-password-request",
    userController.generateResetPasswordToken
  );

  /**
   * @swagger
   * /user/verify-reset-code:
   *   post:
   *     summary: Vérification du code de réinitialisation
   *     tags: [Utilisateurs]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               code:
   *                 type: string
   *                 description: Code de réinitialisation envoyé par email
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: Code valide, prêt à réinitialiser le mot de passe
   *       400:
   *         description: Code invalide ou expiré
   *       500:
   *         description: Erreur serveur
   */
  server.post(
    "/user/verify-reset-code",
    userController.verifyResetPasswordCode
  );

  /**
   * @swagger
   * /user/reset-password:
   *   post:
   *     summary: Réinitialisation du mot de passe
   *     tags: [Utilisateurs]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               code:
   *                 type: string
   *                 description: Code de réinitialisation
   *                 example: "123456"
   *               newPassword:
   *                 type: string
   *                 description: Nouveau mot de passe
   *                 example: "NewPassword123"
   *     responses:
   *       200:
   *         description: Mot de passe réinitialisé avec succès
   *       400:
   *         description: Code de réinitialisation invalide ou expiré
   *       500:
   *         description: Erreur serveur
   */
  server.post("/user/reset-password", userController.resetPassword);

  /**
   * @swagger
   * /user/favorites-themes:
   *   post:
   *     summary: Met à jour les thèmes favoris de l'utilisateur
   *     tags: [Utilisateurs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               themes:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Liste des IDs de thèmes favoris
   *     responses:
   *       200:
   *         description: Thèmes favoris mis à jour avec succès
   *       400:
   *         description: Aucun thème sélectionné ou thèmes invalides
   *       500:
   *         description: Erreur serveur
   */
  server.post(
    "/user/favorites-themes",
    auth,
    userController.updateFavoritesThemes
  );

  /**
   * @swagger
   * /user/update-avatar:
   *   post:
   *     summary: Met à jour l'avatar de l'utilisateur
   *     tags: [Utilisateurs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               avatarId:
   *                 type: string
   *                 description: ID de l'avatar
   *                 example: "64ecf32b28b6f40a6f1f9d5f"
   *     responses:
   *       200:
   *         description: Avatar mis à jour avec succès
   *       400:
   *         description: Avatar non trouvé ou ID invalide
   *       500:
   *         description: Erreur serveur
   */
  server.post("/user/update-avatar", auth, userController.updateAvatar);

  server.post("/user/generate-username", auth, userController.generateUsername);

  server.get("/users/search", auth, userController.searchUsers);
};
