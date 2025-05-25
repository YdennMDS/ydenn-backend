require("dotenv").config();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const cors = require("cors");
const connectDB = require("./config/db");
const http = require("node:http"); // Import du module HTTP
const { Server } = require("socket.io"); // Import de Socket.IO
const express = require("express");

// const hostname = "127.0.0.1";
const hostname = "0.0.0.0";
const port = 3000;
const app = express();

// Créer un serveur HTTP pour permettre à Socket.IO de fonctionner
const httpServer = http.createServer(app);
// Configurer Socket.IO avec le serveur HTTP
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Autoriser toutes les origines (à restreindre si nécessaire)
    methods: ["GET", "POST"],
  },
});

const socketHandler = require("./api/sockets/socketHandler");
socketHandler(io);

// Ne connecte pas à la base de données si on est en mode test (géré par mongodb-memory-server)
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoute = require("./api/routes/userRoute");
userRoute(app);

const themeRoute = require("./api/routes/themeRoute");
themeRoute(app);

const avatarRoute = require("./api/routes/avatarRoute");
avatarRoute(app);

const roomRoute = require("./api/routes/roomRoute");
roomRoute(app);

const messageRoute = require("./api/routes/messageRoute");
messageRoute(app);

const categorieRoute = require("./api/routes/categorieRoute");
categorieRoute(app);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Ydenn API",
      version: "1.0.0",
      description: "Ydenn API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./api/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ne démarre le serveur que si nous ne sommes pas en mode test
if (process.env.NODE_ENV !== "test") {
  httpServer.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

// Exporter pour les tests
module.exports = { app, server: httpServer };
