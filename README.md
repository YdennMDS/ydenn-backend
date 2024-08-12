# Ydenn Backend

Ydenn est une plateforme qui propose des espaces d’échange et de discussions sur des thématiques en respectant les règles de bienséance. Cette application backend fournit les API et services nécessaires pour supporter l'application mobile Ydenn.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)

## Fonctionnalités

- API RESTful pour la gestion des utilisateurs, discussions et messages
- Authentification avec JWT
- Système de modération et filtrage de contenu
- Intégration avec MongoDB pour la gestion des données

## Prérequis

Avant de commencer, assurez-vous d'avoir les outils suivants installés sur votre machine :

- [Node.js](https://nodejs.org/) (version 14.x ou supérieure)
- [MongoDB](https://www.mongodb.com/) (vous pouvez utiliser MongoDB Atlas pour une base de données hébergée)
- [Git](https://git-scm.com/)

## Installation

1. Clonez le repository :

   ```bash
   git clone https://github.com/votre-utilisateur/ydenn-backend.git
   cd ydenn-backend
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

## Configuration

Créez un fichier .env à la racine du projet et configurez les variables d'environnement nécessaires.
Voici un exemple de fichier .env :

```bash
JWT_KEY=yourjwtkey

BASE_URL=yourbaseurl

EMAIL_USER=example@email.fr
EMAIL_PASSWORD=examplepassword
EMAIL_HOST=examplehost
EMAIL_SERVICE=exampleservices
```

## Démarrage

Pour démarrer le serveur en mode développement, exécutez la commande suivante :

```bash
docker compose -f compose.dev.yml up
```

L'API sera accessible à l'adresse

```bash
http://localhost:3000
```

## Structure du projet

Voici une vue d'ensemble de la structure du projet :

```bash
ydenn-backend/
├── src/
│   ├── api/                 # Contient les routes, contrôleurs, modèles et middleware pour l'API
│   ├── index.js             # Configuration et démarrage de l'application Express
│   └── package.json         # Dépendances npm et script
│
├── .env.sample              # Exemple de fichier de configuration des variables d'environnement
├── .gitignore               # Fichiers et dossiers à ignorer par Git
├── compose.dev.yml          # Configuration Docker pour l'environnement de développement
├── compose.prod.yml         # Configuration Docker pour l'environnement de production
└── README.md                # Documentation du projet
```
