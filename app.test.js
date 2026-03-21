const request = require('supertest');
const app = require('./app');

describe('API Ressources', () => {
  beforeEach(() => {
    app.resetTestState();
  });

  it('GET /health - devrait retourner 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('GET /ressources - devrait lister les ressources', async () => {
    const res = await request(app).get('/ressources');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /ressources - devrait créer une ressource (201)', async () => {
    const res = await request(app)
      .post('/ressources')
      .send({ name: "Nouveau Test", description: "Test unitaire" });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Nouveau Test");
  });

  it('POST /ressources - devrait échouer si name est vide (400)', async () => {
    const res = await request(app)
      .post('/ressources')
      .send({ description: "Sans nom" });
    
    expect(res.statusCode).toBe(400);
  });

  it('GET /ressources/:id - devrait retourner 404 pour un ID inexistant', async () => {
    const res = await request(app).get('/ressources/999');
    expect(res.statusCode).toBe(404);
  });

  it('PUT /ressources/:id - devrait modifier une ressource existante', async () => {
    const res = await request(app)
      .put('/ressources/1')
      .send({ name: "Nom Modifié" });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Nom Modifié");
  });

  it('DELETE /ressources/:id - devrait supprimer une ressource', async () => {
    const res = await request(app).delete('/ressources/2');
    expect(res.statusCode).toBe(200);
    
    const check = await request(app).get('/ressources/2');
    expect(check.statusCode).toBe(404);
  });

});