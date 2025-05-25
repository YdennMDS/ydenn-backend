const User = require("../../api/models/userModel");
const mongoose = require("mongoose");

describe("User Model Tests", () => {
  it("devrait créer et sauvegarder un utilisateur avec succès", async () => {
    const userData = {
      user_email: "test@example.com",
      user_password: "password123",
      user_firstName: "Test",
      user_birth_date: new Date("1990-01-01"),
      username: "test_user",
    };

    const validUser = new User(userData);
    const savedUser = await validUser.save();

    // Vérification que l'utilisateur a été sauvegardé correctement
    expect(savedUser._id).toBeDefined();
    expect(savedUser.user_email).toBe(userData.user_email);
    expect(savedUser.user_firstName).toBe(userData.user_firstName);
    expect(savedUser.isConfirmed).toBe(false); // valeur par défaut
  });

  it("devrait échouer à la validation si des champs requis sont manquants", async () => {
    const invalidUser = new User({
      user_email: "test@example.com",
      username: "incomplete_user",
      // user_password, user_firstName et user_birth_date manquants
    });

    let error;
    try {
      await invalidUser.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.user_password).toBeDefined();
    expect(error.errors.user_firstName).toBeDefined();
    expect(error.errors.user_birth_date).toBeDefined();
  });

  it("ne devrait pas permettre deux utilisateurs avec le même email", async () => {
    // Premier utilisateur
    const userData = {
      user_email: "duplicate@example.com",
      user_password: "password123",
      user_firstName: "Original",
      user_birth_date: new Date("1990-01-01"),
      username: "original_user",
    };

    const firstUser = new User(userData);
    await firstUser.save();

    // Deuxième utilisateur avec le même email
    const duplicateUser = new User({
      user_email: "duplicate@example.com",
      user_password: "password456",
      user_firstName: "Duplicate",
      user_birth_date: new Date("1995-05-05"),
      username: "duplicate_user",
    });

    let error;
    try {
      await duplicateUser.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Code d'erreur MongoDB pour duplicate key error
  });
});
