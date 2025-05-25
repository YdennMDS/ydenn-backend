const Message = require("../../api/models/messageModel");
const mongoose = require("mongoose");

describe("Message Model Tests", () => {
  it("devrait créer et sauvegarder un message avec succès", async () => {
    const messageData = {
      message_content: "Ceci est un message de test",
      message_author: new mongoose.Types.ObjectId(),
      message_room: new mongoose.Types.ObjectId(),
    };

    const validMessage = new Message(messageData);
    const savedMessage = await validMessage.save();

    // Vérifier que le message a été sauvegardé correctement
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.message_content).toBe(messageData.message_content);
    expect(savedMessage.message_author.toString()).toBe(
      messageData.message_author.toString()
    );
    expect(savedMessage.message_room.toString()).toBe(
      messageData.message_room.toString()
    );
    expect(savedMessage.message_date).toBeDefined();
    expect(savedMessage.message_isFiltered).toBe(false); // valeur par défaut
    expect(savedMessage.message_filteredReason).toBeNull(); // valeur par défaut
  });

  it("devrait échouer à la validation si des champs requis sont manquants", async () => {
    // Message sans contenu
    const messageWithoutContent = new Message({
      message_author: new mongoose.Types.ObjectId(),
      message_room: new mongoose.Types.ObjectId(),
    });

    let error;
    try {
      await messageWithoutContent.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.message_content).toBeDefined();

    // Message sans auteur
    const messageWithoutAuthor = new Message({
      message_content: "Message sans auteur",
      message_room: new mongoose.Types.ObjectId(),
    });

    error = null;
    try {
      await messageWithoutAuthor.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.message_author).toBeDefined();

    // Message sans room
    const messageWithoutRoom = new Message({
      message_content: "Message sans room",
      message_author: new mongoose.Types.ObjectId(),
    });

    error = null;
    try {
      await messageWithoutRoom.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.message_room).toBeDefined();
  });

  it("devrait créer un message avec des indicateurs de filtrage", async () => {
    const messageData = {
      message_content: "Message propre",
      message_author: new mongoose.Types.ObjectId(),
      message_room: new mongoose.Types.ObjectId(),
      message_isFiltered: true,
      message_filteredReason: "Test de filtrage",
    };

    const validMessage = new Message(messageData);
    const savedMessage = await validMessage.save();

    expect(savedMessage.message_isFiltered).toBe(true);
    expect(savedMessage.message_filteredReason).toBe("Test de filtrage");
  });
});
