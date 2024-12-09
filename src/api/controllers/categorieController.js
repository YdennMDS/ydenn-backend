const Categorie = require("../models/categorieModel");

exports.createCategorie = async (req, res) => {
  const { categorie_name, categorie_description, categorie_image } = req.body;

  const newCategorie = new Categorie({
    categorie_name,
    categorie_description,
    categorie_image,
  });

  try {
    const savedCategorie = await newCategorie.save();
    res.status(201).json(savedCategorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    res.status(200).json(categorie);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
