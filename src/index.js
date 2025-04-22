require("dotenv").config();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const cors = require("cors");
const connectDB = require("./config/db");
const http = require("node:http");
const { Server } = require("socket.io");
const express = require("express");
const schedulerService = require("./api/services/schedulerService");

const hostname = "0.0.0.0";
const port = 3000;
const server = express();

// Créer un serveur HTTP pour permettre à Socket.IO de fonctionner
const httpServer = http.createServer(server);
// Configurer Socket.IO avec le serveur HTTP
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Autoriser toutes les origines (à restreindre si nécessaire)
    methods: ["GET", "POST"],
  },
});

const socketHandler = require("./api/sockets/socketHandler");
const notificationController = require("./api/controllers/notificationController");

// Initialiser le gestionnaire de socket et récupérer l'instance
const socketInstance = socketHandler(io);

// Configurer le contrôleur de notification avec l'instance socket
notificationController.setSocketInstance(socketInstance);

connectDB().then(() => {
  // Planifier le démarrage de toutes les rooms futures
  schedulerService.scheduleAllFutureRooms();
});

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const userRoute = require("./api/routes/userRoute");
userRoute(server);

const themeRoute = require("./api/routes/themeRoute");
themeRoute(server);

const avatarRoute = require("./api/routes/avatarRoute");
avatarRoute(server);

const roomRoute = require("./api/routes/roomRoute");
roomRoute(server);

const messageRoute = require("./api/routes/messageRoute");
messageRoute(server);

const categorieRoute = require("./api/routes/categorieRoute");
categorieRoute(server);

const friendRoute = require("./api/routes/friendRoute");
friendRoute(server);

const notificationRoute = require("./api/routes/notificationRoute");
notificationRoute(server);

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
server.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// // // local server
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// // local server
httpServer.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
