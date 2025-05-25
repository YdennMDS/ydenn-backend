const request = require("supertest");
const Theme = require("../../api/models/themeModel");
const Categorie = require("../../api/models/categorieModel");
const mongoose = require("mongoose");

let app;
let server;
let categorieId;

beforeAll(async () => {
  const indexModule = require("../../index");
  app = indexModule.app;
  server = indexModule.server;

  // Créer une catégorie pour les tests
  const categorie = new Categorie({
    categorie_name: "Catégorie pour Thèmes",
    categorie_description: "Description de la catégorie pour tests de thèmes",
    categorie_image: "categorie_image.jpg",
  });

  const savedCategorie = await categorie.save();
  categorieId = savedCategorie._id;
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("Theme Controller Tests", () => {
  describe("POST /theme/createTheme", () => {
    it("devrait créer un nouveau thème et l'associer à une catégorie", async () => {
      const themeData = {
        theme_name: "Nouveau Thème Test",
        theme_description: "Description pour test d'intégration du thème",
        theme_image: "theme_test.jpg",
        categorie_id: categorieId,
      };

      const response = await request(app)
        .post("/theme/createTheme")
        .send(themeData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Thème créé et associé à la catégorie avec succès."
      );
      expect(response.body).toHaveProperty("theme");
      expect(response.body.theme).toHaveProperty("_id");
      expect(response.body.theme.theme_name).toBe(themeData.theme_name);
      expect(response.body.theme.theme_description).toBe(
        themeData.theme_description
      );
      expect(response.body.theme.theme_image).toBe(themeData.theme_image);

      // Vérifier que le thème a été créé
      const theme = await Theme.findById(response.body.theme._id);
      expect(theme).toBeDefined();
      expect(theme.theme_name).toBe(themeData.theme_name);

      // Vérifier que la catégorie a été mise à jour
      const categorie = await Categorie.findById(categorieId);
      expect(categorie.categorie_theme).toContainEqual(
        new mongoose.Types.ObjectId(response.body.theme._id)
      );
    });

    it("devrait rejeter la création avec des données incomplètes", async () => {
      const incompleteData = {
        theme_name: "Thème Incomplet",
        // theme_description et categorie_id manquants
      };

      const response = await request(app)
        .post("/theme/createTheme")
        .send(incompleteData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Tous les champs requis doivent être fournis."
      );
    });

    it("devrait rejeter la création avec une catégorie inexistante", async () => {
      const invalidCategorieData = {
        theme_name: "Thème avec Catégorie Invalide",
        theme_description: "Description pour test avec catégorie invalide",
        theme_image: "theme_invalid_cat.jpg",
        categorie_id: new mongoose.Types.ObjectId(), // ID inexistant
      };

      const response = await request(app)
        .post("/theme/createTheme")
        .send(invalidCategorieData);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Catégorie non trouvée.");
    });
  });

  describe("GET /theme/getAllThemes", () => {
    beforeEach(async () => {
      // Nettoyer et créer des thèmes de test
      await Theme.deleteMany({});

      const themes = [
        {
          theme_name: "Thème Test 1",
          theme_description: "Description Thème 1",
          theme_image: "theme1.jpg",
        },
        {
          theme_name: "Thème Test 2",
          theme_description: "Description Thème 2",
          theme_image: "theme2.jpg",
        },
      ];

      await Theme.insertMany(themes);
    });

    it("devrait récupérer tous les thèmes", async () => {
      const response = await request(app).get("/theme/getAllThemes");

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      // Vérifier les propriétés des thèmes
      expect(response.body[0]).toHaveProperty("_id");
      expect(response.body[0]).toHaveProperty("theme_name");
      expect(response.body[0]).toHaveProperty("theme_description");
      expect(response.body[0]).toHaveProperty("theme_image");
    });
  });
});
