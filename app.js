if (process.env.NODE_ENV !== 'test') {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const express = require('express');
const prisma = require('./prisma/client');
const { INITIAL_RESOURCES } = require('./lib/initialResources');

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

async function syncResourceIdSequence() {
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"resources"', 'id'),
      COALESCE((SELECT MAX(id) FROM "resources"), 1)
    );
  `);
}

async function seedIfEmpty() {
  const count = await prisma.resource.count();
  if (count === 0) {
    await prisma.resource.createMany({
      data: INITIAL_RESOURCES.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
      })),
    });
    await syncResourceIdSequence();
  }
}

async function resetTestState() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "resources" RESTART IDENTITY CASCADE;'
  );
  await prisma.resource.createMany({
    data: INITIAL_RESOURCES.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
    })),
  });
  await syncResourceIdSequence();
}

if (process.env.NODE_ENV === 'test') {
  app.resetTestState = resetTestState;
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get(
  '/ressources',
  asyncHandler(async (req, res) => {
    const pageQ = req.query.page;
    const limitQ = req.query.limit;
    if (pageQ !== undefined || limitQ !== undefined) {
      const page = Math.max(1, parseInt(String(pageQ), 10) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(String(limitQ), 10) || 10)
      );
      const [data, total] = await Promise.all([
        prisma.resource.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { id: 'asc' },
        }),
        prisma.resource.count(),
      ]);
      return res.status(200).json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 0,
        },
      });
    }
    const resources = await prisma.resource.findMany({
      orderBy: { id: 'asc' },
    });
    res.status(200).json(resources);
  })
);

app.get(
  '/ressources/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }
    const item = await prisma.resource.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }
    res.status(200).json(item);
  })
);

app.post(
  '/ressources',
  asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Le champ 'name' est obligatoire" });
    }
    const newResource = await prisma.resource.create({
      data: {
        name: name.trim(),
        description: typeof description === 'string' ? description : '',
      },
    });
    res.status(201).json(newResource);
  })
);

app.put(
  '/ressources/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(404).json({ error: 'Ressource inexistante' });
    }
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Ressource inexistante' });
    }
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: "Le champ 'name' est obligatoire pour la modification",
      });
    }
    const updated = await prisma.resource.update({
      where: { id },
      data: {
        name: name.trim(),
        description:
          description !== undefined
            ? String(description)
            : existing.description,
      },
    });
    res.status(200).json(updated);
  })
);

app.delete(
  '/ressources/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(404).json({ error: 'Ressource inexistante' });
    }
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Ressource inexistante' });
    }
    await prisma.resource.delete({ where: { id } });
    res.status(200).json({ message: 'Suppression réussie' });
  })
);

app.use((err, req, res, next) => {
  void next;
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

async function start() {
  await prisma.$connect();
  await seedIfEmpty();
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} déjà utilisé. Libère-le : lsof -i :${PORT}  puis kill <PID>\n` +
          `Ou change PORT dans le fichier .env (ex. 3050).`
      );
    }
    throw err;
  });
}

if (require.main === module) {
  start().catch((e) => {
    const refused =
      e.code === 'ECONNREFUSED' ||
      (e.cause && e.cause.code === 'ECONNREFUSED');
    if (refused || e.code === 'P1001') {
      console.error(
        '\nImpossible de joindre PostgreSQL (connexion refusée).\n' +
          '1) Lance Docker Desktop, puis : docker compose up -d db\n' +
          '2) Vérifie DATABASE_URL dans .env (port hôte 55432 avec ce projet)\n' +
          '3) Puis : npx prisma migrate deploy\n'
      );
    }
    console.error(e);
    process.exit(1);
  });
}

module.exports = app;
