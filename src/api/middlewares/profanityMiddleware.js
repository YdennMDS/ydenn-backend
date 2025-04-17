const profanityFilter = require("../utils/profanityFilter");

const profanityFilterMiddleware = (req, res, next) => {
  console.log(
    "[profanityMiddleware] Traitement du message:",
    req.body.message_content
  );

  if (req.body.message_content) {
    // Vérifier si le message contient des mots inappropriés
    if (profanityFilter.containsProfanity(req.body.message_content)) {
      console.log(
        "[profanityMiddleware] Message contenant des mots inappropriés détecté"
      );

      // Récupérer la liste des mots inappropriés
      const profanityWords = profanityFilter.getProfanityList(
        req.body.message_content
      );
      console.log(
        "[profanityMiddleware] Mots inappropriés trouvés:",
        profanityWords
      );

      // Nettoyer le message
      const cleanedMessage = profanityFilter.cleanMessage(
        req.body.message_content
      );
      console.log("[profanityMiddleware] Message nettoyé:", cleanedMessage);

      // Mettre à jour le message avec la version nettoyée
      req.body.message_content = cleanedMessage;

      // Marquer le message comme filtré
      req.body.message_isFiltered = true;
      console.log("[profanityMiddleware] Message marqué comme filtré");

      // Indiquer la raison du filtrage
      req.body.message_filteredReason = `Contenu inapproprié: ${profanityWords.join(
        ", "
      )}`;
      console.log(
        "[profanityMiddleware] Raison du filtrage:",
        req.body.message_filteredReason
      );
    } else {
      console.log("[profanityMiddleware] Message sans contenu inapproprié");
    }
  } else {
    console.log("[profanityMiddleware] Pas de contenu de message à traiter");
  }

  next();
};

module.exports = profanityFilterMiddleware;
