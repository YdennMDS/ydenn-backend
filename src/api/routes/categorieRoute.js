module.exports = (server) => {
  const categorieController = require("../controllers/categorieController");
  const auth = require("../middlewares/authMiddleware");

  server.post(
    "/categorie/createCategorie",
    auth,
    categorieController.createCategorie
  );

  server.get(
    "/categorie/getAllCategories",
    auth,
    categorieController.getAllCategories
  );

  server.get(
    "/categorie/getCategorieById/:id",
    auth,
    categorieController.getCategorieById
  );
};
