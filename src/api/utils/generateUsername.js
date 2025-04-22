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
  firstName = firstName.toLowerCase().replace(/\s+/g, "");
  avatarName = avatarName.toLowerCase().replace(/\s+/g, "");

  // Création de variantes de noms d'utilisateur plus naturelles
  const variants = [
    `${firstName}.${avatarName}`,
    `${firstName}${avatarName}`,
    `${avatarName}_${firstName}`,
    `${firstName}_${Math.floor(Math.random() * 999)}`,
    `${firstName}${avatarName}${day || Math.floor(Math.random() * 99)}`,
    `${avatarName}${month || Math.floor(Math.random() * 12) + 1}${
      year ? year.slice(-2) : Math.floor(Math.random() * 99)
    }`,
    `${firstName}${
      ["cool", "pro", "real", "original", "authentic"][
        Math.floor(Math.random() * 5)
      ]
    }`,
    `the_${avatarName}${Math.floor(Math.random() * 99)}`,
    `${firstName}_${
      ["star", "hero", "master", "expert", "fan"][Math.floor(Math.random() * 5)]
    }`,
    `${avatarName}${
      ["lover", "friend", "fan", "enthusiast"][Math.floor(Math.random() * 4)]
    }`,
  ];

  // Essayer chaque variante jusqu'à en trouver une disponible
  for (const variant of variants) {
    const isAvailable = await isUsernameAvailable(variant);
    if (isAvailable) {
      return variant;
    }
  }

  // Si aucune variante n'est disponible, créer un nom avec un suffixe aléatoire
  let username;
  let isUnique = false;

  while (!isUnique) {
    const randomSuffix = Math.floor(Math.random() * 9999);
    username = `${firstName}_${avatarName}_${randomSuffix}`;
    isUnique = await isUsernameAvailable(username);
  }

  return username;
}

// Fonction utilitaire pour vérifier la disponibilité d'un nom d'utilisateur
async function isUsernameAvailable(username) {
  const existingUser = await User.findOne({ username });
  return !existingUser;
}

module.exports = generateUsername;
