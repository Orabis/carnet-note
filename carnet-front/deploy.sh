#!/bin/bash

# --- 1. Chargement des variables ---
if [ -f .env ]; then
  # On exporte les variables en ignorant les commentaires
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ Erreur : Fichier .env introuvable."
  exit 1
fi

# --- 2. Vérification des variables critiques ---
# On s'assure que rien n'est vide
: "${DEPLOY_USER:?Faut définir DEPLOY_USER dans .env}"
: "${DEPLOY_IP:?Faut définir DEPLOY_IP dans .env}"
: "${DEPLOY_DEST:?Faut définir DEPLOY_DEST dans .env}"
: "${DEPLOY_BACKUP:?Faut définir DEPLOY_BACKUP dans .env}"

# --- 3. Exécution ---
echo "🏗️  Build du projet..."
pnpm build

echo "💾 Backup de la version actuelle sur le serveur..."
# 1. On vérifie si DEPLOY_DEST existe.
# 2. Si oui, on supprime l'ancien backup et on crée le nouveau.
# 3. Plus de 'sudo' ici !
ssh $DEPLOY_USER@$DEPLOY_IP "if [ -d $DEPLOY_DEST ]; then rm -rf $DEPLOY_BACKUP && cp -r $DEPLOY_DEST $DEPLOY_BACKUP; echo '✅ Backup terminé.'; else echo 'ℹ️ Pas de version existante, saut du backup.'; fi"
echo "🚀 Synchronisation (Rsync) vers $DEPLOY_DEST..."
# rsync avec gestion auto des permissions pour éviter le 403
rsync -avz --delete --no-g \
      --chmod=D2775,F664 \
      dist/ $DEPLOY_USER@$DEPLOY_IP:$DEPLOY_DEST/

echo "✨ Déploiement terminé avec succès !"
