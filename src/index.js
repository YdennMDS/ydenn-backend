require("dotenv").config();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
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
