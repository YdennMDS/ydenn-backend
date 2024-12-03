require("dotenv").config();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const https = require("https");

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");

const hostname = "127.0.0.1";
const port = 3000;
const server = express();

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

// // local server
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// production server
const sslServer = https.createServer(
  {
    key: fs.readFileSync("/etc/nginx/certs/api.ydenn.fr/privkey.pem"),
    cert: fs.readFileSync("/etc/nginx/certs/api.ydenn.fr/fullchain.pem"),
  },
  server
);

sslServer.listen(port, hostname, () => {
  console.log(`Secure Server running at https://${hostname}:${port}/`);
});

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
