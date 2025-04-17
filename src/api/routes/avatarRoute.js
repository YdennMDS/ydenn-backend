module.exports = (server) => {
  const avatarController = require("../controllers/avatarController");

  /**
   * @openapi
   * components:
   *   schemas:
   *     Avatar:
   *       type: object
   *       required:
   *         - avatar_name
   *         - avatar_image
   *       properties:
   *         avatar_name:
   *           type: string
   *           description: Le nom de l'avatar (doit être unique)
   *           example: "Dragon Master"
   *         avatar_image:
   *           type: string
   *           description: URL de l'image de l'avatar
   *           example: "https://example.com/images/avatar.png"
   *         avatar_description:
   *           type: string
   *           description: Description optionnelle de l'avatar
   *           example: "Un avatar puissant avec des pouvoirs de feu"
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Date de création de l'avatar
   *           example: "2024-09-05T12:34:56Z"
   */

  /**
   * @openapi
   * /avatar/createAvatar:
   *   post:
   *     summary: Crée un nouvel avatar
   *     tags: [Avatars]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Avatar'
   *           description: Les informations nécessaires pour créer un avatar
   *     responses:
   *       201:
   *         description: Avatar créé avec succès
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Avatar'
   *       400:
   *         description: Requête invalide ou données manquantes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Nom et image de l'avatar sont requis"
   *       500:
   *         description: Erreur serveur
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erreur lors de la création de l'avatar"
   */
  server.post("/avatar/createAvatar", avatarController.createAvatar);
  server.get("/avatar/getAllAvatar", avatarController.getAllAvatar);
};
