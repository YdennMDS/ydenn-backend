const request = require("supertest");
const User = require("../../api/models/userModel");
const crypto = require("node:crypto");

let app;
let server;

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

describe("Email Confirmation Tests", () => {
  describe("GET /user/confirm/:token", () => {
    let confirmationToken;

    beforeEach(async () => {
      // Créer un token de confirmation
      confirmationToken = crypto.randomBytes(20).toString("hex");

      // Créer un utilisateur non confirmé
      const user = new User({
        user_email: "confirm@example.com",
        user_password: "password123",
        user_firstName: "Confirm",
        user_birth_date: new Date("1990-01-01"),
        isConfirmed: false,
        username: "confirm_test_user",
        confirmationToken: confirmationToken,
      });
      await user.save();
    });

    it("devrait confirmer un email avec un token valide", async () => {
      const response = await request(app).get(
        `/user/confirm/${confirmationToken}`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Email confirmed");

      // Vérifier que l'utilisateur est maintenant confirmé
      const user = await User.findOne({ user_email: "confirm@example.com" });
      expect(user.isConfirmed).toBe(true);
      expect(user.confirmationToken).toBeUndefined();
    });

    it("devrait rejeter la confirmation avec un token invalide", async () => {
      const response = await request(app).get("/user/confirm/invalidtoken");

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid confirmation token");
    });
  });
});
