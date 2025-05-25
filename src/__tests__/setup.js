const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("node:path");

// Charger les variables d'environnement du fichier .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

let mongoServer;

// Configuration avant tous les tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

// Nettoyage après chaque test
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Fermeture de la connexion après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
