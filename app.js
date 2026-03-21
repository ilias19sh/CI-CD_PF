const express = require('express');
const app = express();
app.use(express.json());

const PORT = 3000;

const INITIAL_RESOURCES = [
  { id: 1, name: "Ordinateur Portable", description: "MacBook Pro M3" },
  { id: 2, name: "Clavier Mécanique", description: "Keychron K2 V2" },
  { id: 3, name: "Souris Sans Fil", description: "Logitech MX Master 3S" },
  { id: 4, name: "Écran 4K", description: "Dell UltraSharp 27" },
  { id: 5, name: "Casque Audio", description: "Sony WH-1000XM5" }
];

let resources = INITIAL_RESOURCES.map((r) => ({ ...r }));

function resetTestState() {
  resources = INITIAL_RESOURCES.map((r) => ({ ...r }));
}

if (process.env.NODE_ENV === 'test') {
  app.resetTestState = resetTestState;
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get('/ressources', (req, res) => {
  res.status(200).json(resources);
});

app.get('/ressources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = resources.find(r => r.id === id);

  if (!item) {
    return res.status(404).json({ error: "Ressource non trouvée" });
  }
  res.status(200).json(item);
});

app.post('/ressources', (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === "") {
    return res.status(400).json({ error: "Le champ 'name' est obligatoire" });
  }

  const newResource = {
    id: resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1,
    name: name.trim(),
    description: description || ""
  };

  resources.push(newResource);
  res.status(201).json(newResource);
});

app.put('/ressources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;

  const index = resources.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Ressource inexistante" });
  }

  if (!name || typeof name !== 'string' || name.trim() === "") {
    return res.status(400).json({ error: "Le champ 'name' est obligatoire pour la modification" });
  }

  resources[index] = { 
    ...resources[index], 
    name: name.trim(), 
    description: description !== undefined ? description : resources[index].description 
  };
  
  res.status(200).json(resources[index]);
});

app.delete('/ressources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = resources.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Ressource inexistante" });
  }

  resources.splice(index, 1);
  res.status(200).json({ message: "Suppression réussie" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;