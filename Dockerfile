# 1. Utilisation d'une image légère
FROM node:22

# 2. Création du dossier de travail
WORKDIR /usr/src/app

# 3. Copie des fichiers de dépendances en premier (optimisation du cache Docker)
COPY package*.json ./

# 4. Installation des dépendances (uniquement prod pour plus de légèreté)
# Si tu as besoin de lancer les tests dans le conteneur, utilise "npm install"
RUN npm install --omit=dev

# 5. Copie du reste du code source
COPY . .

# 6. L'API écoute sur le port 3000
EXPOSE 3000

# 7. Utilisation d'un utilisateur non-root pour la sécurité
USER node

# 8. Commande de lancement
CMD [ "node", "app.js" ]