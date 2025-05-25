# Tests du projet Ydenn Backend

Ce dossier contient tous les tests pour le projet Ydenn Backend, organisés en deux catégories principales :

## Structure des dossiers

- **unit** : Tests unitaires pour chaque modèle et fonctions utilitaires
- **integration** : Tests d'intégration pour les contrôleurs et les routes API

## Exécution des tests

Pour exécuter tous les tests :

```bash
npm test
```

Pour exécuter les tests en mode watch (développement) :

```bash
npm run test:watch
```

Pour générer un rapport de couverture de tests :

```bash
npm run test:coverage
```

## Configuration des tests

Les tests utilisent :

- **Jest** : Framework de test principal
- **Supertest** : Pour tester les points de terminaison HTTP
- **MongoDB Memory Server** : Base de données MongoDB en mémoire pour isoler les tests

Le fichier `setup.js` à la racine du dossier `__tests__` configure la base de données en mémoire avant l'exécution des tests.

## Écriture de nouveaux tests

### Tests unitaires

Les tests unitaires doivent être placés dans le dossier `unit/` et nommés selon le pattern `[nom-du-module].test.js`.

### Tests d'intégration

Les tests d'intégration doivent être placés dans le dossier `integration/` et nommés selon le pattern `[nom-du-controleur].test.js`.

## Mocks

Pour les services externes (comme l'envoi d'emails), utilisez des mocks Jest pour éviter l'envoi réel de données pendant les tests.

Exemple :

```javascript
jest.mock("../../api/services/emailService", () => ({
  sendConfirmationEmail: jest.fn(),
  sendResetPassword: jest.fn(),
}));
```
