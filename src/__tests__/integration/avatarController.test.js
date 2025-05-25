const request = require("supertest");
const Avatar = require("../../api/models/avatarModel");

let app;
let server;
let avatarId;

beforeAll(async () => {
  const indexModule = require("../../index");
  app = indexModule.app;
  server = indexModule.server;
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("Avatar Controller Tests", () => {
  describe("POST /avatar/createAvatar", () => {
    it("devrait créer un nouvel avatar avec succès", async () => {
      const avatarData = {
        avatar_name: `Test Avatar ${Date.now()}`,
        avatar_image: "https://example.com/test-avatar.png",
        avatar_description: "Description de l'avatar de test",
      };

      const response = await request(app)
        .post("/avatar/createAvatar")
        .send(avatarData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Avatar créé avec succès");
      expect(response.body).toHaveProperty("avatar");
      expect(response.body.avatar).toHaveProperty("_id");

      // Stocker l'ID pour d'autres tests si nécessaire
      avatarId = response.body.avatar._id;

      // Vérifier que l'avatar a été créé en base de données
      const avatar = await Avatar.findById(avatarId);
      expect(avatar).toBeDefined();
      expect(avatar.avatar_name).toBe(avatarData.avatar_name);
      expect(avatar.avatar_image).toBe(avatarData.avatar_image);
      expect(avatar.avatar_description).toBe(avatarData.avatar_description);
    });

    it("devrait rejeter la création avec des données incomplètes", async () => {
      // Avatar sans nom
      const avatarWithoutName = {
        avatar_image: "https://example.com/no-name-avatar.png",
        avatar_description: "Avatar sans nom",
      };

      const response = await request(app)
        .post("/avatar/createAvatar")
        .send(avatarWithoutName);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Nom et image de l'avatar sont requis");

      // Avatar sans image
      const avatarWithoutImage = {
        avatar_name: `No Image Avatar ${Date.now()}`,
        avatar_description: "Avatar sans image",
      };

      const response2 = await request(app)
        .post("/avatar/createAvatar")
        .send(avatarWithoutImage);

      expect(response2.statusCode).toBe(400);
      expect(response2.body).toHaveProperty("error");
      expect(response2.body.error).toBe("Nom et image de l'avatar sont requis");

      // Avatar vide
      const emptyAvatar = {};

      const response3 = await request(app)
        .post("/avatar/createAvatar")
        .send(emptyAvatar);

      expect(response3.statusCode).toBe(400);
      expect(response3.body).toHaveProperty("error");
      expect(response3.body.error).toBe("Nom et image de l'avatar sont requis");
    });

    it("devrait rejeter un avatar avec un nom déjà utilisé", async () => {
      // Créer un premier avatar
      const uniqueName = `Unique Test Avatar ${Date.now()}`;
      const firstAvatar = {
        avatar_name: uniqueName,
        avatar_image: "https://example.com/first-avatar.png",
      };

      await request(app).post("/avatar/createAvatar").send(firstAvatar);

      // Tenter de créer un second avatar avec le même nom
      const secondAvatar = {
        avatar_name: uniqueName,
        avatar_image: "https://example.com/second-avatar.png",
      };

      const response = await request(app)
        .post("/avatar/createAvatar")
        .send(secondAvatar);

      expect(response.statusCode).toBe(500); // Erreur gérée côté serveur
      expect(response.body).toHaveProperty("error");
      // Nous ne pouvons pas tester le message exact car l'erreur est gérée de manière générique dans le catch
    });

    it("devrait créer un avatar sans description", async () => {
      const avatarNoDescription = {
        avatar_name: `No Description Avatar ${Date.now()}`,
        avatar_image: "https://example.com/no-description-avatar.png",
      };

      const response = await request(app)
        .post("/avatar/createAvatar")
        .send(avatarNoDescription);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("avatar");
      expect(response.body.avatar.avatar_description).toBeUndefined();
    });
  });
});
