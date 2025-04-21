const Room = require("../models/roomModel");
const Categorie = require("../models/categorieModel");
const Theme = require("../models/themeModel");
const notificationController = require("./notificationController");
const schedulerService = require("../services/schedulerService");

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

    // Planifier le démarrage automatique de la room
    if (room_start_time) {
      await schedulerService.scheduleRoomStart(savedRoom);
    }

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
    const rooms = await Room.find()
      .populate("room_owner", "username")
      .populate("room_categorie", "categorie_name")
      .populate("room_thematic", "theme_name")
      .populate("room_participants", "username");
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des rooms" });
    console.error(error);
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate({
        path: "room_owner", // Peupler le champ `room_owner`
        select: "username", // Sélectionner uniquement `username`
        populate: {
          path: "userAvatar", // Peupler le champ `userAvatar` de `room_owner`
          select: "avatar_image", // Sélectionner uniquement `avatar_image` dans `userAvatar`
        },
      })
      .populate({
        path: "room_participants",
        select: "username",
        populate: { path: "userAvatar", select: "avatar_image" },
      })
      .populate("room_categorie", "categorie_name")
      .populate("room_thematic", "theme_name");
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

exports.registerToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room introuvable." });
    }

    if (room.room_participants.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Vous êtes déjà inscrit à cette room." });
    }

    if (room.room_participants.length >= room.room_max_participants) {
      return res.status(400).json({
        error: `Cette room a atteint la limite maximale de ${room.room_max_participants} participants.`,
      });
    }

    room.room_participants.push(userId);
    await room.save();

    res.status(200).json({
      message: "Vous avez été inscrit à la room avec succès.",
      room,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'inscription à la room." });
    console.error(error);
  }
};

exports.unregisterFromRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room introuvable." });
    }

    if (!room.room_participants.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Vous n'êtes pas inscrit à cette room." });
    }

    room.room_participants = room.room_participants.filter(
      (participant) => participant.toString() !== userId
    );
    await room.save();

    res.status(200).json({
      message: "Vous avez été désinscrit de la room avec succès.",
      room,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la désinscription de la room." });
    console.error(error);
  }
};

exports.isUserInRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id; // Utilise l'id de l'utilisateur authentifié

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room introuvable." });
    }

    const isUserInRoom = room.room_participants.includes(userId);
    res.status(200).json({ isUserInRoom });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la vérification de l'inscription." });
    console.error(error);
  }
};

exports.updateRoomStartTime = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { room_start_time } = req.body;
    const userId = req.user.id;

    if (!room_start_time) {
      return res.status(400).json({ error: "Date de démarrage requise" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room introuvable" });
    }

    // Vérifier que l'utilisateur est le propriétaire de la room
    if (room.room_owner.toString() !== userId) {
      return res.status(403).json({
        error: "Vous n'êtes pas autorisé à modifier cette room",
      });
    }

    // Mettre à jour la date de démarrage
    room.room_start_time = new Date(room_start_time);
    await room.save();

    // Replanifier le démarrage automatique
    await schedulerService.scheduleRoomStart(room);

    res.status(200).json({
      message: "Date de démarrage mise à jour avec succès",
      room,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la date de démarrage:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la mise à jour de la date de démarrage",
    });
  }
};

exports.startRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Récupérer la room avec les participants
    const room = await Room.findById(roomId).populate("room_participants");

    if (!room) {
      return res.status(404).json({ error: "Room introuvable" });
    }

    // Annuler la planification automatique si elle existe
    schedulerService.cancelRoomStart(roomId);

    // Envoyer une notification à tous les participants
    const participantsToNotify = room.room_participants;

    console.log(
      `Envoi de notifications à ${participantsToNotify.length} participants`
    );

    for (const participant of participantsToNotify) {
      try {
        await notificationController.createNotification(participant._id, {
          sender: userId,
          type: "room_start",
          roomId: room._id,
        });
        console.log(`Notification envoyée à ${participant._id}`);
      } catch (notifError) {
        console.error(
          `Erreur lors de l'envoi de la notification à ${participant._id}:`,
          notifError
        );
      }
    }

    res.status(200).json({ message: "Room démarrée avec succès" });
  } catch (error) {
    console.error("Erreur détaillée lors du démarrage de la room:", error);
    res.status(500).json({ error: "Erreur lors de la démarrage de la room" });
  }
};
