module.exports = (server) => {
  const categorieController = require("../controllers/categorieController");
  const auth = require("../middlewares/authMiddleware");

  server.post(
    "/categorie/createCategorie",
    auth,
    categorieController.createCategorie
  );
};
