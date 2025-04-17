const User = require("../models/userModel");

async function generateUsername(firstName, avatarName, birthDate) {
  if (birthDate instanceof Date) {
    birthDate = birthDate.toISOString().split("T")[0];
  }

  const [year, month, day] = birthDate.split("-");

  console.log(`Year: ${year || "N/A"}`);
  console.log(`Month: ${month || "N/A"}`);
  console.log(`Day: ${day || "N/A"}`);

  // Normalisation des noms pour éviter les espaces ou caractères spéciaux
  const baseUsername = `${firstName.toLowerCase()}_${avatarName
    .toLowerCase()
    .replace(/\s+/g, "")}`;

  const test = day * month;

  let username = baseUsername;
  let suffix = 1;
  let isUnique = false;

  // Vérification de l'unicité du nom d'utilisateur
  while (!isUnique) {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      isUnique = true;
    } else {
      // Ajouter un suffixe numérique si le nom est déjà pris
      username = `${baseUsername}${suffix}`;
      suffix++;
    }
  }

  return username;
}

module.exports = generateUsername;
