const User = require("../models/userModel");
const Theme = require("../models/themeModel");
const Avatar = require("../models/avatarModel");
const generateUsername = require("../utils/generateUsername");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  sendConfirmationEmail,
  sendResetPassword,
} = require("../services/emailService");

exports.userRegister = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.user_password, salt);

    // Validate email is not already use

    const existingUser = await User.findOne({
      user_email: req.body.user_email,
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Validate email format

    if (req.body.user_password !== req.body.user_password_confirm) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate password length

    if (req.body.user_password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Validate password contains at least 1 number

    const numberRegex = /\d/;

    if (!numberRegex.test(req.body.user_password)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least 1 number" });
    }

    // Validate date format

    const userInputDate = req.body.user_birth_date;

    const parts = userInputDate.split("/");

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const parsedDate = new Date(Date.UTC(year, month, day));

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month ||
      parsedDate.getDate() !== day
    ) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const newUser = new User({
      ...req.body,
      user_birth_date: parsedDate,
      user_password: hashedPassword,
      confirmationToken: crypto.randomBytes(20).toString("hex"),
    });
    const user = await newUser.save();

    sendConfirmationEmail(
      req.body.user_email,
      `${req.body.user_firstName}`,
      newUser.confirmationToken
    );

    res.status(201).json({ message: `Utilisateur créé ${user}` });
    console.log("Utilisateur créé");
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Requête invalide" });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const user = await User.findOne({ user_email: req.body.user_email });

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    if (!user.isConfirmed) {
      res
        .status(401)
        .json({ message: "Veuillez d'abord vérifier votre compte" });
      return;
    }

    const validPassword = await bcrypt.compare(
      req.body.user_password,
      user.user_password
    );
    if (!validPassword) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const userData = {
      id: user._id,
      email: user.user_email,
      firstName: user.user_firstName,
      birthDate: user.user_birth_date,
    };
    const token = await jwt.sign(userData, process.env.JWT_KEY, {
      expiresIn: "24h",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors du traitement" });
  }
};

exports.confirmEmail = async (req, res) => {
  const user = await User.findOne({ confirmationToken: req.params.token });

  if (!user) {
    return res.status(400).json({ message: "Invalid confirmation token" });
  }

  user.isConfirmed = true;
  user.confirmationToken = undefined;
  await user.save();

  res.json({ message: "Email confirmed" });
};

exports.generateResetPasswordToken = async (req, res) => {
  try {
    const user = await User.findOne({ user_email: req.body.user_email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpires = Date.now() + 300000; // 5 minutes
    await user.save();

    sendResetPassword(user.user_email, resetCode);

    res.json({ message: "Reset password code sent." });
  } catch (error) {
    res.status(500).json({ message: "Error generating reset code" });
  }
};

exports.verifyResetPasswordCode = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordCode: req.body.code,
      resetPasswordCodeExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Code is invalid or has expired" });
    }

    user.isCodeVerified = true;
    await user.save();

    res.json({ message: "Code is valid. Proceed with password reset." });
  } catch (error) {
    res.status(500).json({ message: "Error verifying reset code" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordCode: req.body.code,
      resetPasswordCodeExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    if (!user.isCodeVerified) {
      res.status(401).json({
        message: "Veuillez d'abord entrer le code de vérification",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.user_password = await bcrypt.hash(req.body.newPassword, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

exports.updateFavoritesThemes = async (req, res) => {
  try {
    const userId = req.user.id;
    const themeIds = req.body.themes;

    if (!themeIds || themeIds.length === 0) {
      return res.status(400).json({ error: "Aucun thème sélectionné" });
    }

    // Vérifie que les thèmes existent
    const themes = await Theme.find({ _id: { $in: themeIds } });

    if (themes.length !== themeIds.length) {
      return res
        .status(400)
        .json({ error: "Certains thèmes sélectionnés n'existent pas" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { userFavoritesThemes: themeIds },
      { new: true }
    ).populate("userFavoritesThemes");

    res.json({
      message: "Thématiques mises à jour avec succès",
      themes: user.userFavoritesThemes,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour des thématiques" });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatarId } = req.body; // Utilisation de l'ID de l'avatar

    if (!avatarId) {
      return res.status(400).json({ error: "ID de l'avatar manquant" });
    }

    // Vérifie que l'avatar existe
    const avatar = await Avatar.findById(avatarId);
    if (!avatar) {
      return res.status(400).json({ error: "Avatar non trouvé" });
    }

    // Met à jour l'utilisateur avec l'ID de l'avatar
    const user = await User.findByIdAndUpdate(
      userId,
      { userAvatar: avatarId },
      { new: true }
    ).populate("userAvatar");

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({
      message: "Avatar mis à jour avec succès",
      userAvatar: user.userAvatar,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de l'avatar" });
    console.error(error);
  }
};

exports.generateUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const avatar = await Avatar.findById(user.userAvatar);

    if (!user || !avatar) {
      return res
        .status(400)
        .json({ error: "Utilisateur ou avatar non trouvé" });
    }

    // Génération du nom d'utilisateur basé sur le prénom et l'avatar
    const username = await generateUsername(
      user.user_firstName,
      avatar.avatar_name,
      user.user_birth_date
    );

    user.username = username;
    await user.save();

    res.json({
      message: "Nom d'utilisateur généré avec succès",
      username: user.username,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la génération du nom d'utilisateur" });
    console.log(error);
  }
};
