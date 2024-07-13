const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendConfirmationEmail } = require("../services/emailService");

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
