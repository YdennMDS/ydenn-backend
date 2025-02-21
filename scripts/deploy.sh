#!/bin/bash

# Definir le chemin de base
BASE_DIR="/root/ydenn-backend"

# Chemin du fichier log
LOG_FILE="/root/ydenn-logs/deploy.log"

# Fonction pour loguer un message avec timestamp
log_message() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Créer le dossier de logs s'il n'existe pas
mkdir -p "/root/ydenn-logs" || { echo "Erreur lors de la création du dossier de logs"; exit 1; }

if [ ! -d "$BASE_DIR" ]; then
  log_message "Le répertoire $BASE_DIR n'existe pas. Création du répertoire."
  mkdir -p "$BASE_DIR" || { log_message "Erreur lors de la création du répertoire $BASE_DIR"; exit 1; }
fi

log_message "Début du déploiement"

# Arrêter les conteneurs existants
log_message "Arrêt des conteneurs de production"
sudo docker compose -f "$BASE_DIR/compose.prod.yml" down || log_message "Aucun processus à arrêter"

# Mettre à jour le code source
log_message "Mise à jour du code source"
cd "$BASE_DIR" || exit

# Réinitialiser les modifications locales
git reset --hard HEAD || { log_message "Erreur lors du reset des modifications locales"; exit 1; }

# Faire un pull pour mettre à jour le dépôt
git pull origin main >> "$LOG_FILE" 2>&1 || { log_message "Erreur lors du pull du dépôt"; exit 1; }

# Aller dans le dossier src
cd src || exit

# Supprimer l'ancienne version du dossier certs
log_message "Suppression du dossier certs"
rm -R "$BASE_DIR/certs/" >> "$LOG_FILE" 2>&1

# Créer les répertoires nécessaires
log_message "Création des répertoires nécessaires"
mkdir -p "$BASE_DIR/certs/api.ydenn.fr" >> "$LOG_FILE" 2>&1

# Copier les certificats pour api.ydenn.fr
log_message "Copie des certificats"
sudo cp /etc/letsencrypt/live/api.ydenn.fr/fullchain.pem "$BASE_DIR/certs/api.ydenn.fr"
sudo cp /etc/letsencrypt/live/api.ydenn.fr/privkey.pem "$BASE_DIR/certs/api.ydenn.fr"

# Construire et démarrer les nouveaux conteneurs
log_message "Démarrage des conteneurs de production"
docker compose -f "$BASE_DIR/compose.prod.yml" up -d --build >> "$LOG_FILE" 2>&1

log_message "Déploiement terminé avec succès."

echo "Déploiement terminé avec succès."