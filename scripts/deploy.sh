#!/bin/bash

# Definir le chemin de base
BASE_DIR="/home/ubuntu/ydenn-backend"

# Créer le dossier de logs s'il n'existe pas
mkdir -p "/home/ubuntu/ydenn-logs" || { echo "Erreur lors de la création du dossier de logs"; exit 1; }

# Chemin du fichier log
LOG_FILE="/home/ubuntu/ydenn-logs/deploy.log"

# Fonction pour loguer un message avec timestamp
log_message() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_message "Début du déploiement"

# Arrêter les conteneurs existants
log_message "Arrêt des conteneurs de production"
sudo docker compose -f "$BASE_DIR/compose.prod.yml" down || log_message "Aucun processus à arrêter"

# Mettre à jour le code source
log_message "Mise à jour du code source"
cd "$BASE_DIR" || exit

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

# Copier les certificats pour api.frtv.fr
log_message "Copie des certificats"
sudo cp /etc/letsencrypt/live/api.ydenn.fr/fullchain.pem "$BASE_DIR/certs/api.ydenn.fr"
sudo cp /etc/letsencrypt/live/api.ydenn.fr/privkey.pem "$BASE_DIR/certs/api.ydenn.fr"

# Construire et démarrer les nouveaux conteneurs
log_message "Démarrage des conteneurs de production"
docker compose -f "$BASE_DIR/compose.prod.yml" up -d --build >> "$LOG_FILE" 2>&1

# Sauvegarder l'état de PM2
pm2 save >> "$LOG_FILE" 2>&1

log_message "Déploiement terminé avec succès."

echo "Déploiement terminé avec succès."