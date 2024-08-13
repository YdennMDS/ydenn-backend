module.exports = (server) => {
  const themeController = require("../controllers/themeController");

  server.post("/theme/createTheme", themeController.createTheme);
};
