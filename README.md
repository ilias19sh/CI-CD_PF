# CI-CD_PF — API inventaire & pipeline

API REST **Node.js + Express** avec persistance **PostgreSQL** via **Prisma**, tests **Jest + Supertest**, lint **ESLint**, pipeline **GitHub Actions** (lint → tests), image **Docker** et **Docker Compose** (API + base).

## Prérequis

- Node.js 20+ (recommandé 22)
- PostgreSQL 16+ **ou** Docker / Docker Compose

## Configuration

```bash
cp .env.example .env
# Avec Docker Compose, la base est exposée sur le port **55432** (hôte) pour éviter les conflits avec un Postgres local (voir `docker-compose.yml`).
```

Sous **Prisma ORM 7**, l’URL de connexion est définie dans `prisma.config.ts` (plus dans `schema.prisma`). Le client utilise l’adaptateur **`@prisma/adapter-pg`** (voir `prisma/client.js`).

## Lancer la base (Docker)

```bash
docker compose up -d db
```

## Migrations & seed

```bash
npm install
npx prisma migrate deploy
npm run db:seed   # optionnel : réinitialise les 5 ressources de démo
```

Au **premier démarrage** de l’API (`npm start`), si la table est vide, les mêmes données de démo sont insérées automatiquement (seed au démarrage).

## Démarrer l’API en local

```bash
npm start
```

En local, le port par défaut dans `.env.example` est **3050** (les ports **3000** / **3001** sont souvent déjà pris). Ajuste `PORT` dans ton `.env` si besoin.

## Tests & lint

Avec PostgreSQL accessible (ex. `docker compose up -d db`) :

```bash
npx prisma migrate deploy
npm test
npm run lint
```

Les tests utilisent par défaut `DATABASE_URL=postgresql://app:app@localhost:55432/app` (voir `jest.config.js`).

## Docker (API + Postgres)

```bash
docker compose up --build
```

L’API applique les migrations au démarrage du conteneur, puis démarre sur le port **3000**.

## Routes principales

| Méthode | Route | Description |
|--------|--------|-------------|
| GET | `/health` | Health check |
| GET | `/ressources` | Liste (tableau JSON) |
| GET | `/ressources?page=1&limit=10` | Liste paginée (`data` + `pagination`) |
| GET | `/ressources/:id` | Détail |
| POST | `/ressources` | Création (`name` obligatoire) |
| PUT | `/ressources/:id` | Mise à jour (`name` obligatoire) |
| DELETE | `/ressources/:id` | Suppression |

## Structure du dépôt

```
.github/workflows/ci.yml   # Pipeline CI
prisma.config.ts           # URL BDD + migrations (Prisma 7)
app.js                      # Application Express
app.test.js                 # Tests Jest
lib/initialResources.js     # Données de seed
prisma/                     # Schéma, migrations, client, seed
package.json
```

## CI/CD

Sur **push** et **pull request** vers `main` : job **lint**, puis job **tests** (avec service PostgreSQL et `prisma migrate deploy`). Sur `main` uniquement : build et push de l’image vers **GHCR** (voir workflow).
