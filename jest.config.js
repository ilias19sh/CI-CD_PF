/** @type {import('jest').Config} */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://app:app@localhost:55432/app?schema=public';
}

module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
};
