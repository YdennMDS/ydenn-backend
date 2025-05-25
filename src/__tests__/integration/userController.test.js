const request = require("supertest");
const User = require("../../api/models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Création d'une instance Express
let app;
let server;

// Mock des services d'email pour éviter l'envoi réel
jest.mock("../../api/services/emailService", () => ({
  sendConfirmationEmail: jest.fn(),
  sendResetPassword: jest.fn(),
}));

beforeAll(async () => {
  // Importer l'application après avoir configuré les mocks
  const indexModule = require("../../index");
  app = indexModule.app;
  server = indexModule.server;
});

afterAll(async () => {
  // Fermer le serveur après les tests
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("User Controller Tests", () => {
  describe("POST /user/register", () => {
    it("devrait créer un nouvel utilisateur avec succès", async () => {
      const userData = {
        user_email: "test@example.com",
        user_password: "password123",
        user_password_confirm: "password123",
        user_firstName: "Test",
        user_birth_date: "01/01/1990",
        username: "test_integration_user",
      };

      const response = await request(app).post("/user/register").send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toContain("Utilisateur créé");

      // Vérifier en base de données
      const user = await User.findOne({ user_email: userData.user_email });
      expect(user).toBeDefined();
      expect(user.user_firstName).toBe(userData.user_firstName);
    });

    it("devrait rejeter l'inscription avec un email déjà utilisé", async () => {
      // Créer d'abord un utilisateur
      const existingUser = new User({
        user_email: "existing@example.com",
        user_password: await bcrypt.hash("password123", 10),
        user_firstName: "Existing",
        user_birth_date: new Date("1990-01-01"),
        username: "existing_user",
      });
      await existingUser.save();

      // Tenter de créer un utilisateur avec le même email
      const userData = {
        user_email: "existing@example.com",
        user_password: "password123",
        user_password_confirm: "password123",
        user_firstName: "Test",
        user_birth_date: "01/01/1990",
        username: "existing_duplicate_user",
      };

      const response = await request(app).post("/user/register").send(userData);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Email already in use");
    });

    it("devrait rejeter l'inscription si les mots de passe ne correspondent pas", async () => {
      const userData = {
        user_email: "test2@example.com",
        user_password: "password123",
        user_password_confirm: "different",
        user_firstName: "Test",
        user_birth_date: "01/01/1990",
        username: "mismatch_password_user",
      };

      const response = await request(app).post("/user/register").send(userData);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Passwords do not match");
    });
  });

  describe("POST /user/login", () => {
    beforeEach(async () => {
      // Créer un utilisateur confirmé pour les tests de connexion
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);

      const confirmedUser = new User({
        user_email: "confirmed@example.com",
        user_password: hashedPassword,
        user_firstName: "Confirmed",
        user_birth_date: new Date("1990-01-01"),
        isConfirmed: true,
        username: "confirmed_login_user",
      });

      await confirmedUser.save();
    });

    it("devrait authentifier un utilisateur avec des identifiants valides", async () => {
      const loginData = {
        user_email: "confirmed@example.com",
        user_password: "password123",
      };

      const response = await request(app).post("/user/login").send(loginData);

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();

      // Vérifier que le token est valide
      const decodedToken = jwt.verify(response.body.token, process.env.JWT_KEY);
      expect(decodedToken.email).toBe(loginData.user_email);
    });

    it("devrait rejeter la connexion avec des identifiants invalides", async () => {
      const loginData = {
        user_email: "confirmed@example.com",
        user_password: "wrongPassword",
      };

      const response = await request(app).post("/user/login").send(loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("Email ou mot de passe incorrect");
    });

    it("devrait rejeter la connexion pour un compte non confirmé", async () => {
      // Créer un utilisateur non confirmé avec un username pour éviter l'erreur de duplicate key
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);

      const unconfirmedUser = new User({
        user_email: "unconfirmed@example.com",
        user_password: hashedPassword,
        user_firstName: "Unconfirmed",
        user_birth_date: new Date("1990-01-01"),
        isConfirmed: false,
        username: "unconfirmed_user", // Ajouter un username unique
      });

      await unconfirmedUser.save();

      const loginData = {
        user_email: "unconfirmed@example.com",
        user_password: "password123",
      };

      const response = await request(app).post("/user/login").send(loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        "Veuillez d'abord vérifier votre compte"
      );
    });
  });
});
