const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Auth header is missing" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Requête invalide" });
  }
};
