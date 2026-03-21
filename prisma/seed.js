const prisma = require('./client');
const { INITIAL_RESOURCES } = require('../lib/initialResources');

async function main() {
  await prisma.resource.deleteMany();
  await prisma.resource.createMany({
    data: INITIAL_RESOURCES.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
    })),
  });
}

main()
  .then(() => prisma.disconnectAll())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
