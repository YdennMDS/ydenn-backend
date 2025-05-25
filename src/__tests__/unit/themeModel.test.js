const Theme = require("../../api/models/themeModel");
const mongoose = require("mongoose");

describe("Theme Model Tests", () => {
  it("devrait créer et sauvegarder un thème avec succès", async () => {
    const themeData = {
      theme_name: "Test Theme",
      theme_description: "Description de test pour un thème",
      theme_image: "test_theme_image.jpg",
    };

    const validTheme = new Theme(themeData);
    const savedTheme = await validTheme.save();

    // Vérification que le thème a été sauvegardé correctement
    expect(savedTheme._id).toBeDefined();
    expect(savedTheme.theme_name).toBe(themeData.theme_name);
    expect(savedTheme.theme_description).toBe(themeData.theme_description);
    expect(savedTheme.theme_image).toBe(themeData.theme_image);
    expect(savedTheme.theme_createdAt).toBeDefined();
    expect(savedTheme.theme_updatedAt).toBeDefined();
    expect(Array.isArray(savedTheme.theme_rooms)).toBe(true);
    expect(savedTheme.theme_rooms.length).toBe(0);
  });

  it("devrait échouer à la validation si des champs requis sont manquants", async () => {
    const invalidTheme = new Theme({
      theme_name: "Theme Incomplet",
      // theme_description manquant
    });

    let error;
    try {
      await invalidTheme.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.theme_description).toBeDefined();
  });

  it("ne devrait pas permettre deux thèmes avec le même nom", async () => {
    // Premier thème
    const themeData = {
      theme_name: "Theme Unique",
      theme_description: "Description pour le premier thème",
      theme_image: "theme1.jpg",
    };

    const firstTheme = new Theme(themeData);
    await firstTheme.save();

    // Deuxième thème avec le même nom
    const duplicateTheme = new Theme({
      theme_name: "Theme Unique",
      theme_description: "Description pour le deuxième thème",
      theme_image: "theme2.jpg",
    });

    let error;
    try {
      await duplicateTheme.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Code d'erreur MongoDB pour duplicate key error
  });
});
