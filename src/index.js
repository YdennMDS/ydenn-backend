require("dotenv").config();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const http = require("http"); // Import du module HTTP
const { Server } = require("socket.io"); // Import de Socket.IO

// const hostname = "127.0.0.1";
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

connectDB();

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

// Configurer Socket.IO pour gérer les connexions
io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté :", socket.id);

  // Rejoindre une room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Utilisateur ${socket.id} a rejoint la room ${roomId}`);
  });

  // Réception d'un message et diffusion dans la room correspondante
  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;

    // Émettre le message à tous les utilisateurs de la room
    io.to(roomId).emit("receiveMessage", {
      message,
      roomId,
      sentAt: new Date().toISOString(),
    });
    console.log(`Message envoyé dans la room ${roomId}:`, message);
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté :", socket.id);
  });
});

// // // local server
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// // local server
httpServer.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
