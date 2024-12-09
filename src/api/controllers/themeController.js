const Theme = require("../models/themeModel");
const Categorie = require("../models/categorieModel");

exports.createTheme = async (req, res) => {
  const { theme_name, theme_description, theme_image, categorie_id } = req.body;

  if (!theme_name || !theme_description || !categorie_id) {
    return res
      .status(400)
      .json({ message: "Tous les champs requis doivent être fournis." });
  }

  const newTheme = new Theme({
    theme_name,
    theme_description,
    theme_image,
  });

  try {
    const savedTheme = await newTheme.save();

    // Mise à jour de la catégorie pour inclure le thème
    const categorie = await Categorie.findById(categorie_id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    categorie.categorie_theme.push(savedTheme._id);
    await categorie.save();

    res.status(201).json({
      message: "Thème créé et associé à la catégorie avec succès.",
      theme: savedTheme,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find();
    res.status(200).json(themes);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
