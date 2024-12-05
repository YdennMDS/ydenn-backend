const Room = require("../models/roomModel");
const User = require("../models/userModel");

exports.createRoom = async (req, res) => {
  try {
    const {
      room_duration,
      room_start_time,
      room_type,
      room_isSponsored,
      room_sponsor_name,
    } = req.body;

    if (room_isSponsored && !room_sponsor_name) {
      return res.status(400).json({ error: "Nom du sponsor requis" });
    }

    if (room_type !== "public" && room_type !== "private") {
      return res.status(400).json({ error: "Type de room incorrect" });
    }

    const newRoom = new Room({
      // room_categorie,
      // room_thematic,
      room_duration,
      room_start_time,
      room_type,
      room_isSponsored,
      room_sponsor_name,
      room_owner: req.user.id,
    });

    await newRoom.save();
    res.status(201).json({ message: "Room créée avec succès", room: newRoom });
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
