const Avatar = require("../../api/models/avatarModel");
const mongoose = require("mongoose");

describe("Avatar Model Tests", () => {
  it("devrait créer et sauvegarder un avatar avec succès", async () => {
    const avatarData = {
      avatar_name: `Test Avatar ${Date.now()}`, // Pour garantir l'unicité
      avatar_image: "https://example.com/test-avatar.png",
      avatar_description: "Avatar pour les tests",
    };

    const validAvatar = new Avatar(avatarData);
    const savedAvatar = await validAvatar.save();

    // Vérifier que l'avatar a été sauvegardé correctement
    expect(savedAvatar._id).toBeDefined();
    expect(savedAvatar.avatar_name).toBe(avatarData.avatar_name);
    expect(savedAvatar.avatar_image).toBe(avatarData.avatar_image);
    expect(savedAvatar.avatar_description).toBe(avatarData.avatar_description);
    expect(savedAvatar.createdAt).toBeDefined();
  });

  it("devrait échouer à la validation si des champs requis sont manquants", async () => {
    // Avatar sans nom
    const avatarWithoutName = new Avatar({
      avatar_image: "https://example.com/no-name-avatar.png",
      avatar_description: "Avatar sans nom",
    });

    let error;
    try {
      await avatarWithoutName.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.avatar_name).toBeDefined();

    // Avatar sans image
    const avatarWithoutImage = new Avatar({
      avatar_name: `No Image Avatar ${Date.now()}`,
      avatar_description: "Avatar sans image",
    });

    error = null;
    try {
      await avatarWithoutImage.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.avatar_image).toBeDefined();
  });

  it("devrait échouer à la validation si le nom de l'avatar n'est pas unique", async () => {
    const avatarName = `Unique Avatar Test ${Date.now()}`;

    // Créer le premier avatar
    const firstAvatar = new Avatar({
      avatar_name: avatarName,
      avatar_image: "https://example.com/first-avatar.png",
    });
    await firstAvatar.save();

    // Essayer de créer un deuxième avatar avec le même nom
    const secondAvatar = new Avatar({
      avatar_name: avatarName,
      avatar_image: "https://example.com/second-avatar.png",
    });

    let error;
    try {
      await secondAvatar.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    // La validation d'unicité est gérée au niveau de la base de données
    // donc l'erreur devrait avoir un code de dupplication (E11000)
    expect(error.code).toBe(11000);
  });

  it("devrait créer un avatar sans description", async () => {
    const avatarData = {
      avatar_name: `No Description Avatar ${Date.now()}`,
      avatar_image: "https://example.com/no-description-avatar.png",
      // Pas de description
    };

    const validAvatar = new Avatar(avatarData);
    const savedAvatar = await validAvatar.save();

    expect(savedAvatar._id).toBeDefined();
    expect(savedAvatar.avatar_name).toBe(avatarData.avatar_name);
    expect(savedAvatar.avatar_image).toBe(avatarData.avatar_image);
    expect(savedAvatar.avatar_description).toBeUndefined();
  });
});
