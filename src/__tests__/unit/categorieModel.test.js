const Categorie = require("../../api/models/categorieModel");
const mongoose = require("mongoose");

describe("Categorie Model Tests", () => {
  it("devrait créer et sauvegarder une catégorie avec succès", async () => {
    const categorieData = {
      categorie_name: "Test Categorie",
      categorie_description: "Description de test pour une catégorie",
      categorie_image: "test_image.jpg",
    };

    const validCategorie = new Categorie(categorieData);
    const savedCategorie = await validCategorie.save();

    // Vérification que la catégorie a été sauvegardée correctement
    expect(savedCategorie._id).toBeDefined();
    expect(savedCategorie.categorie_name).toBe(categorieData.categorie_name);
    expect(savedCategorie.categorie_description).toBe(
      categorieData.categorie_description
    );
    expect(savedCategorie.categorie_image).toBe(categorieData.categorie_image);
    expect(savedCategorie.categorie_createdAt).toBeDefined();
    expect(savedCategorie.categorie_updatedAt).toBeDefined();
  });

  it("devrait échouer à la validation si des champs requis sont manquants", async () => {
    const invalidCategorie = new Categorie({
      categorie_name: "Categorie Incomplète",
      // categorie_description et categorie_image manquants
    });

    let error;
    try {
      await invalidCategorie.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.categorie_description).toBeDefined();
    expect(error.errors.categorie_image).toBeDefined();
  });

  it("ne devrait pas permettre deux catégories avec le même nom", async () => {
    // Première catégorie
    const categorieData = {
      categorie_name: "Categorie Unique",
      categorie_description: "Description pour la première catégorie",
      categorie_image: "image1.jpg",
    };

    const firstCategorie = new Categorie(categorieData);
    await firstCategorie.save();

    // Deuxième catégorie avec le même nom
    const duplicateCategorie = new Categorie({
      categorie_name: "Categorie Unique",
      categorie_description: "Description pour la deuxième catégorie",
      categorie_image: "image2.jpg",
    });

    let error;
    try {
      await duplicateCategorie.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Code d'erreur MongoDB pour duplicate key error
  });
});
