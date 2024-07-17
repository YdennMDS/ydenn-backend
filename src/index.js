require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const hostname = "127.0.0.1";
const port = 3000;
const server = express();

connectDB();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const userRoute = require("./api/routes/userRoute");
userRoute(server);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
