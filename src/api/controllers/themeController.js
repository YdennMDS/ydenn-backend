const Theme = require("../models/themeModel");

exports.createTheme = async (req, res) => {
  const { theme_name, theme_description, theme_image } = req.body;

  const newTheme = new Theme({
    theme_name,
    theme_description,
    theme_image,
  });

  try {
    const savedTheme = await newTheme.save();
    res.status(201).json(savedTheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
