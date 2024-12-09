module.exports = (server) => {
  const themeController = require("../controllers/themeController");

  /**
   * @openapi
   * components:
   *   schemas:
   *     Theme:
   *       type: object
   *       required:
   *         - theme_name
   *         - theme_description
   *       properties:
   *         theme_name:
   *           type: string
   *           description: Le nom du thème (doit être unique)
   *           example: "Nature"
   *         theme_description:
   *           type: string
   *           description: Description du thème
   *           example: "Thème basé sur la nature et les paysages naturels"
   *         theme_image:
   *           type: string
   *           description: URL de l'image associée au thème
   *           example: "https://example.com/images/theme-nature.png"
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Date de création du thème
   *           example: "2024-09-05T12:34:56Z"
   */

  /**
   * @swagger
   * /theme/createTheme:
   *   post:
   *     summary: Crée un nouveau thème
   *     tags: [Thèmes]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Theme'
   *           description: Les informations nécessaires pour créer un thème
   *     responses:
   *       201:
   *         description: Thème créé avec succès
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Theme'
   *       400:
   *         description: Requête invalide ou données manquantes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erreur lors de la création du thème"
   *       500:
   *         description: Erreur serveur
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erreur serveur"
   */
  server.post("/theme/createTheme", themeController.createTheme);

  server.get("/theme/getAllThemes", themeController.getAllThemes);
};
