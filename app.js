const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const app = express();

app.use(express.json());

app.get('/ressources', async (req, res) => {
  const ressources = await prisma.ressource.findMany();
  res.json(ressources);
});

app.post('/ressources', async (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: "Nom requis" });
  
  const nouvelle = await prisma.ressource.create({
    data: { name: req.body.name, description: req.body.description }
  });
  res.status(201).json(nouvelle);
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; 
    res.json({ status: "OK", database: "Connected" });
  } catch (e) {
    res.status(500).json({ status: "Error", database: "Disconnected" });
  }
});

module.exports = app;