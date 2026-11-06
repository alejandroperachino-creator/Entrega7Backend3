import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';

describe('Functional - Logger, Swagger y rutas inexistentes', () => {
  it('GET /api/logger responde OK con estructura esperada', async () => {
    const response = await request(app).get('/api/logger');

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      ok: true,
      message: 'logger route ok'
    });
    expect(response.body.requestId).to.be.a('string').and.not.empty;
  });

  it('GET /api/logger/test genera logs y responde OK', async () => {
    const response = await request(app).get('/api/logger/test');

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      ok: true,
      message: 'se generaron logs en todos los niveles'
    });
    expect(response.body.requestId).to.be.a('string').and.not.empty;
  });

  it('GET /api/logger/error responde error controlado en formato estándar', async () => {
    const response = await request(app).get('/api/logger/error');

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'TEST_LOGGER_ERROR',
      message: 'logger test error'
    });
    expect(response.body.error.id).to.be.a('number');
  });

  it('GET /api/docs/ permite acceder a Swagger UI', async () => {
    const response = await request(app).get('/api/docs/');

    expect(response.status).to.equal(200);
    expect(response.headers['content-type']).to.include('text/html');
    expect(response.text).to.include('Swagger UI');
  });

  it('GET /api/ruta-inexistente responde 404 con formato de error estándar', async () => {
    const response = await request(app).get('/api/ruta-inexistente');

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error.code).to.equal('NOT_FOUND_ERROR');
    expect(response.body.error.message).to.include('Ruta no encontrada');
    expect(response.body.error.id).to.be.a('number');
  });
});
