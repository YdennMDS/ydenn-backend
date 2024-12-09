const Room = require("../models/roomModel");
const Categorie = require("../models/categorieModel");
const Theme = require("../models/themeModel");

exports.createRoom = async (req, res) => {
  try {
    const {
      room_categorie,
      room_thematic,
      room_duration,
      room_start_time,
      room_type,
      room_isSponsored,
      room_sponsor_name,
    } = req.body;

    if (!room_categorie || !room_thematic) {
      return res
        .status(400)
        .json({ error: "Catégorie et thématique requises." });
    }

    if (room_isSponsored && !room_sponsor_name) {
      return res.status(400).json({ error: "Nom du sponsor requis" });
    }

    if (room_type !== "public" && room_type !== "private") {
      return res.status(400).json({ error: "Type de room incorrect" });
    }

    const categorie = await Categorie.findById(room_categorie);
    if (!categorie) {
      return res.status(404).json({ error: "Catégorie introuvable." });
    }

    const thematic = await Theme.findById(room_thematic);
    if (!thematic) {
      return res.status(404).json({ error: "Thématique introuvable." });
    }

    const newRoom = new Room({
      room_categorie,
      room_thematic,
      room_duration,
      room_start_time,
      room_type,
      room_isSponsored,
      room_sponsor_name,
      room_owner: req.user.id,
    });

    const savedRoom = await newRoom.save();

    categorie.categorie_theme.push(savedRoom._id);
    thematic.rooms = thematic.rooms || [];
    thematic.rooms.push(savedRoom._id);

    await categorie.save();
    await thematic.save();

    res
      .status(201)
      .json({ message: "Room créée avec succès", room: savedRoom });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création de la room" });
    console.error(error);
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("room_owner", "username");
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des rooms" });
    console.error(error);
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "room_owner",
      "username"
    );
    if (!room) {
      return res.status(404).json({ error: "Room introuvable" });
    }
    res.status(200).json(room);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la room" });
    console.error(error);
  }
};
