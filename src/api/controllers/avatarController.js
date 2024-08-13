const Avatar = require("../models/avatarModel");

exports.createAvatar = async (req, res) => {
  try {
    const { avatar_name, avatar_image, avatar_description } = req.body;

    if (!avatar_name || !avatar_image) {
      return res
        .status(400)
        .json({ error: "Nom et image de l'avatar sont requis" });
    }

    const newAvatar = new Avatar({
      avatar_name,
      avatar_image,
      avatar_description,
    });

    await newAvatar.save();
    res
      .status(201)
      .json({ message: "Avatar créé avec succès", avatar: newAvatar });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création de l'avatar" });
    console.error(error);
  }
};
