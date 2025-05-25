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
    // Paramètres de pagination et filtrage
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Filtres possibles
    const filter = {};

    // Filtrer par type de salle (public/private)
    if (req.query.type && ["public", "private"].includes(req.query.type)) {
      filter.room_type = req.query.type;
    }

    // Filtrer par catégorie
    if (req.query.categorie) {
      filter.room_categorie = req.query.categorie;
    }

    // Filtrer par thématique
    if (req.query.thematic) {
      filter.room_thematic = req.query.thematic;
    }

    // Filtrer les salles sponsorisées
    if (req.query.sponsored === "true") {
      filter.room_isSponsored = true;
    } else if (req.query.sponsored === "false") {
      filter.room_isSponsored = false;
    }

    // Filtrer par date de début (après une certaine date)
    if (req.query.startAfter) {
      filter.room_start_time = { $gte: new Date(req.query.startAfter) };
    }

    // Filtrer par disponibilité (salles qui ne sont pas pleines)
    if (req.query.available === "true") {
      // $expr permet d'utiliser des opérateurs d'agrégation dans une requête find
      filter.$expr = {
        $lt: [{ $size: "$room_participants" }, "$room_max_participants"],
      };
    }

    // Exécuter la requête avec pagination
    const rooms = await Room.find(filter)
      .populate("room_owner", "username")
      .populate("room_categorie", "categorie_name")
      .populate("room_thematic", "theme_name")
      .populate("room_participants", "username")
      .sort({ room_start_time: 1 }) // Trier par date de démarrage
      .skip(skip)
      .limit(limit);

    // Obtenir le nombre total de salles pour la pagination
    const total = await Room.countDocuments(filter);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Renvoyer les salles avec les métadonnées de pagination
    res.status(200).json({
      rooms,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
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
