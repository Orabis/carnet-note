# Registre de Réunions et d'Actions

## 1. Description du Projet

Cette application est un outil professionnel conçu pour consigner et suivre les éléments importants discutés lors des réunions. Elle permet de transformer les conversations en actions concrètes et en décisions traçables.

L'objectif est de centraliser les informations clés, d'assurer la clarté sur les responsabilités et de faciliter le suivi des tâches post-réunion.

## 2. Fonctionnalités

*   **Création d'Entrées :** Ajoutez rapidement des notes, des décisions ou des tâches.
*   **Types d'Entrées :**
    *   **Décision/Note :** Pour enregistrer une information clé, une décision prise ou une note importante.
    *   **Tâche :** Pour définir une action à réaliser, avec un responsable assigné.
*   **Assignation :** Attribuez chaque entrée à un collaborateur pour clarifier les responsabilités.
*   **Catégorisation :** Utilisez des labels (catégories) pour organiser et retrouver facilement les entrées.
*   **Filtrage et Tri :** Recherchez des entrées par collaborateur, contenu textuel, ou catégorie, et triez-les par date.
*   **Authentification :** Un système d'utilisateurs sécurisé pour garantir la confidentialité des données.

## 3. Stack Technique

Ce projet est construit sur une architecture moderne et performante, séparant clairement le frontend du backend.

*   **Backend (`carnet-back`) :**
    *   **Framework :** FastAPI
    *   **Base de données & ORM :** SQLModel (basé sur Pydantic et SQLAlchemy)
    *   **Langage :** Python 3.11+

*   **Frontend (`carnet-front`) :**
    *   **Framework :** Vue.js 3 (avec l'API de Composition)
    *   **Langage :** TypeScript
    *   **Outils de build :** Vite

## 4. Structure du Projet

Le projet est organisé en deux dossiers principaux :

*   `carnet-back/` : Contient toute la logique backend (API, base de données, etc.).
*   `carnet-front/` : Contient l'application frontend (composants Vue, services, etc.).

## 5. Démarrage Rapide

Pour lancer l'application en local, vous pouvez utiliser Docker Compose :

### Backend
Dans le backend, avoir un .env avec pour exemple : 
```bash
DB_PASSWORD=test1234
DB_NAME=carnet_dbdb
DB_USER=carnet
DB_PORT=5431
DB_ADDRESS=localhost
SECRET_KEY=41a88c32d71ff40307df80a6517086b839e80a89028ce8ec23123954ae19104b
```
Et lancer le conteneur de la base de donnée

```bash
docker-compose up 
```
Initialiser avec poetry :
```
poetry install
```
et lancer l'application une fois que tout est bon
```
poetry run fastapi dev src/main.py
```

### Frontend

Avoir un .env avec la valeur de l'url du backend : 
`VITE_API_URL=http://127.0.0.1:8000`

Et installer avec PNPM (NPM Possible)
```pnpm install```
ensuite lancer l'application

`pnpm dev` ou npm `npm run dev`