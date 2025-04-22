const fs = require("node:fs");
const path = require("node:path");

// Fonction pour charger les mots interdits depuis un fichier JSON
const loadBadWords = (lang) => {
  try {
    const filePath = path.join(__dirname, `../../json/badwords-${lang}.json`);
    console.log(`[profanityFilter] Chargement du fichier: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`[profanityFilter] Le fichier ${filePath} n'existe pas`);
      return [];
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    console.log(`[profanityFilter] Contenu du fichier ${lang}:`, rawData);

    const parsed = JSON.parse(rawData);
    if (!parsed.words || !Array.isArray(parsed.words)) {
      console.error(`[profanityFilter] Format invalide pour ${lang}`);
      return [];
    }

    console.log(`[profanityFilter] Mots chargés pour ${lang}:`, parsed.words);
    return parsed.words;
  } catch (error) {
    console.error(
      `[profanityFilter] Erreur lors du chargement du fichier badwords-${lang}.json:`,
      error
    );
    return [];
  }
};

// Charger les listes de mots
console.log("[profanityFilter] Chargement des listes de mots interdits");
const frenchWords = loadBadWords("fr");
const englishWords = loadBadWords("en") || [];

// Créer une liste complète des mots interdits
const badWords = [...frenchWords, ...englishWords];
console.log("[profanityFilter] Liste complète des mots interdits:", badWords);

// Fonction pour échapper les caractères spéciaux dans une expression régulière
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Fonction pour remplacer un mot par des astérisques
const replaceWithAsterisks = (word) => {
  return "*".repeat(word.length);
};

// Fonction pour nettoyer un texte
const cleanMessage = (message) => {
  console.log("[profanityFilter] Message original:", message);

  let cleanedMessage = message;

  // Parcourir tous les mots interdits et les remplacer
  badWords.forEach((badWord) => {
    // Échapper les caractères spéciaux et créer une expression régulière
    const escapedWord = escapeRegExp(badWord);
    const regex = new RegExp(`\\b${escapedWord}\\b`, "gi");

    // Remplacer le mot par des astérisques
    cleanedMessage = cleanedMessage.replace(
      regex,
      replaceWithAsterisks(badWord)
    );
  });

  console.log("[profanityFilter] Message nettoyé:", cleanedMessage);
  return cleanedMessage;
};

// Fonction pour vérifier si un texte contient un mot interdit
const containsProfanity = (message) => {
  if (!message) return false;

  // Convertir en minuscules pour une comparaison insensible à la casse
  const lowerMessage = message.toLowerCase();

  // Vérifier chaque mot interdit
  for (const word of badWords) {
    // Échapper les caractères spéciaux
    const escapedWord = escapeRegExp(word.toLowerCase());
    const regex = new RegExp(`\\b${escapedWord}\\b`, "i");

    if (regex.test(lowerMessage)) {
      console.log(
        `[profanityFilter] Mot interdit trouvé: "${word}" dans "${message}"`
      );
      return true;
    }
  }

  console.log("[profanityFilter] Aucun mot interdit trouvé dans:", message);
  return false;
};

// Fonction pour obtenir les mots interdits trouvés dans un message
const getProfanityList = (message) => {
  if (!message) return [];

  const lowerMessage = message.toLowerCase();
  const foundWords = badWords.filter((word) => {
    // Échapper les caractères spéciaux
    const escapedWord = escapeRegExp(word.toLowerCase());
    const regex = new RegExp(`\\b${escapedWord}\\b`, "i");
    return regex.test(lowerMessage);
  });

  console.log("[profanityFilter] Mots inappropriés trouvés:", foundWords);
  return foundWords;
};

module.exports = {
  cleanMessage,
  containsProfanity,
  getProfanityList,
};
