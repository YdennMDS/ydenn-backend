const Room = require("../../api/models/roomModel");
const mongoose = require("mongoose");

describe("Room Model Tests", () => {
  it("devrait créer et sauvegarder une salle publique avec succès", async () => {
    const roomData = {
      room_categorie: new mongoose.Types.ObjectId(),
      room_thematic: new mongoose.Types.ObjectId(),
      room_duration: 60, // 60 minutes
      room_start_time: new Date(),
      room_type: "public",
      room_owner: new mongoose.Types.ObjectId(),
      room_max_participants: 15,
    };

    const validRoom = new Room(roomData);
    const savedRoom = await validRoom.save();

    // Vérification que la salle a été sauvegardée correctement
    expect(savedRoom._id).toBeDefined();
    expect(savedRoom.room_categorie.toString()).toBe(
      roomData.room_categorie.toString()
    );
    expect(savedRoom.room_thematic.toString()).toBe(
      roomData.room_thematic.toString()
    );
    expect(savedRoom.room_duration).toBe(roomData.room_duration);
    expect(savedRoom.room_start_time).toEqual(roomData.room_start_time);
    expect(savedRoom.room_type).toBe(roomData.room_type);
    expect(savedRoom.room_isSponsored).toBe(false); // valeur par défaut
    expect(savedRoom.room_created_at).toBeDefined();
    expect(savedRoom.room_updatedAt).toBeDefined();
    expect(savedRoom.room_owner.toString()).toBe(
      roomData.room_owner.toString()
    );
    expect(Array.isArray(savedRoom.room_participants)).toBe(true);
    expect(savedRoom.room_participants.length).toBe(0);
    expect(savedRoom.room_max_participants).toBe(
      roomData.room_max_participants
    );
  });

  it("devrait créer et sauvegarder une salle sponsorisée avec succès", async () => {
    const roomData = {
      room_categorie: new mongoose.Types.ObjectId(),
      room_thematic: new mongoose.Types.ObjectId(),
      room_duration: 120, // 120 minutes
      room_start_time: new Date(),
      room_type: "private",
      room_isSponsored: true,
      room_sponsor_name: "Sponsor Test",
      room_owner: new mongoose.Types.ObjectId(),
      room_max_participants: 20,
    };

    const validRoom = new Room(roomData);
    const savedRoom = await validRoom.save();

    expect(savedRoom._id).toBeDefined();
    expect(savedRoom.room_isSponsored).toBe(true);
    expect(savedRoom.room_sponsor_name).toBe(roomData.room_sponsor_name);
    expect(savedRoom.room_type).toBe("private");
  });

  it("devrait échouer à la validation si des champs requis sont manquants", async () => {
    const invalidRoom = new Room({
      room_categorie: new mongoose.Types.ObjectId(),
      room_thematic: new mongoose.Types.ObjectId(),
      // room_duration, room_start_time, room_type et room_owner manquants
    });

    let error;
    try {
      await invalidRoom.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.room_duration).toBeDefined();
    expect(error.errors.room_start_time).toBeDefined();
    expect(error.errors.room_type).toBeDefined();
    expect(error.errors.room_owner).toBeDefined();
  });

  it("devrait refuser un type de salle invalide", async () => {
    const invalidRoomType = new Room({
      room_categorie: new mongoose.Types.ObjectId(),
      room_thematic: new mongoose.Types.ObjectId(),
      room_duration: 60,
      room_start_time: new Date(),
      room_type: "invalid_type", // type invalide
      room_owner: new mongoose.Types.ObjectId(),
    });

    let error;
    try {
      await invalidRoomType.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.room_type).toBeDefined();
  });

  it("devrait permettre de créer une salle sponsorisée sans nom de sponsor (la validation est au niveau du contrôleur)", async () => {
    const room = new Room({
      room_categorie: new mongoose.Types.ObjectId(),
      room_thematic: new mongoose.Types.ObjectId(),
      room_duration: 60,
      room_start_time: new Date(),
      room_type: "public",
      room_isSponsored: true, // sponsorisée
      room_owner: new mongoose.Types.ObjectId(),
    });

    // Cette opération devrait réussir car la validation est faite au niveau du contrôleur
    const savedRoom = await room.save();
    expect(savedRoom._id).toBeDefined();
    expect(savedRoom.room_isSponsored).toBe(true);
    expect(savedRoom.room_sponsor_name).toBeUndefined();
  });
});
