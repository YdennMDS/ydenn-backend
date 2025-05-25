const request = require("supertest");
const User = require("../../api/models/userModel");
const bcrypt = require("bcrypt");

// Mock des services d'email
jest.mock("../../api/services/emailService", () => ({
  sendConfirmationEmail: jest.fn(),
  sendResetPassword: jest.fn(),
}));

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

describe("User Reset Password Tests", () => {
  describe("POST /user/reset-password-request", () => {
    beforeEach(async () => {
      // Créer un utilisateur confirmé
      const user = new User({
        user_email: "reset@example.com",
        user_password: await bcrypt.hash("password123", 10),
        user_firstName: "Reset",
        user_birth_date: new Date("1990-01-01"),
        isConfirmed: true,
        username: "reset_test_user",
      });
      await user.save();
    });

    it("devrait générer un code de réinitialisation pour un email existant", async () => {
      const response = await request(app)
        .post("/user/reset-password-request")
        .send({ user_email: "reset@example.com" });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Reset password code sent.");

      // Vérifier que le code a été généré
      const user = await User.findOne({ user_email: "reset@example.com" });
      expect(user.resetPasswordCode).toBeDefined();
      expect(user.resetPasswordCodeExpires).toBeDefined();
    });

    it("devrait répondre avec 404 pour un email inexistant", async () => {
      const response = await request(app)
        .post("/user/reset-password-request")
        .send({ user_email: "nonexistent@example.com" });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("POST /user/verify-reset-code", () => {
    beforeEach(async () => {
      // Créer un utilisateur avec un code de réinitialisation
      const user = new User({
        user_email: "verify@example.com",
        user_password: await bcrypt.hash("password123", 10),
        user_firstName: "Verify",
        user_birth_date: new Date("1990-01-01"),
        isConfirmed: true,
        username: "verify_test_user",
        resetPasswordCode: "123456",
        resetPasswordCodeExpires: Date.now() + 300000, // 5 minutes
      });
      await user.save();

      // Créer un utilisateur avec un code expiré
      const expiredUser = new User({
        user_email: "expired@example.com",
        user_password: await bcrypt.hash("password123", 10),
        user_firstName: "Expired",
        user_birth_date: new Date("1990-01-01"),
        isConfirmed: true,
        username: "expired_test_user",
        resetPasswordCode: "654321",
        resetPasswordCodeExpires: Date.now() - 300000, // -5 minutes (expiré)
      });
      await expiredUser.save();
    });

    it("devrait vérifier correctement un code valide", async () => {
      const response = await request(app)
        .post("/user/verify-reset-code")
        .send({ code: "123456" });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Code is valid. Proceed with password reset."
      );

      // Vérifier que isCodeVerified est mis à true
      const user = await User.findOne({ resetPasswordCode: "123456" });
      expect(user.isCodeVerified).toBe(true);
    });

    it("devrait rejeter un code expiré", async () => {
      const response = await request(app)
        .post("/user/verify-reset-code")
        .send({ code: "654321" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Code is invalid or has expired");
    });

    it("devrait rejeter un code invalide", async () => {
      const response = await request(app)
        .post("/user/verify-reset-code")
        .send({ code: "000000" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Code is invalid or has expired");
    });
  });

  describe("POST /user/reset-password", () => {
    beforeEach(async () => {
      // Créer un utilisateur avec un code de réinitialisation et code vérifié
      const user = new User({
        user_email: "complete@example.com",
        user_password: await bcrypt.hash("oldpassword", 10),
        user_firstName: "Complete",
        user_birth_date: new Date("1990-01-01"),
        isConfirmed: true,
        username: "complete_test_user",
        resetPasswordCode: "123456",
        resetPasswordCodeExpires: Date.now() + 300000,
        isCodeVerified: true,
      });
      await user.save();

      // Utilisateur avec code non vérifié
      const unverifiedUser = new User({
        user_email: "unverified@example.com",
        user_password: await bcrypt.hash("oldpassword", 10),
        user_firstName: "Unverified",
        user_birth_date: new Date("1990-01-01"),
        isConfirmed: true,
        username: "unverified_test_user",
        resetPasswordCode: "789012",
        resetPasswordCodeExpires: Date.now() + 300000,
        isCodeVerified: false,
      });
      await unverifiedUser.save();
    });

    it("devrait réinitialiser le mot de passe avec succès", async () => {
      const response = await request(app).post("/user/reset-password").send({
        code: "123456",
        newPassword: "newpassword123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Password has been reset successfully"
      );

      // Vérifier que le mot de passe a été changé
      const user = await User.findOne({ user_email: "complete@example.com" });
      expect(user.resetPasswordCode).toBeUndefined();
      expect(user.resetPasswordCodeExpires).toBeUndefined();

      // Vérifier que le nouveau mot de passe fonctionne
      const validPassword = await bcrypt.compare(
        "newpassword123",
        user.user_password
      );
      expect(validPassword).toBe(true);
    });

    it("devrait rejeter la réinitialisation si le code n'est pas vérifié", async () => {
      const response = await request(app).post("/user/reset-password").send({
        code: "789012",
        newPassword: "newpassword123",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        "Veuillez d'abord entrer le code de vérification"
      );
    });

    it("devrait rejeter la réinitialisation avec un code invalide", async () => {
      const response = await request(app).post("/user/reset-password").send({
        code: "000000",
        newPassword: "newpassword123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Token is invalid or has expired");
    });
  });
});
