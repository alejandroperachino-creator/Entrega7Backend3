import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('GET /api/logger/test responde 200 y genera logs', async () => {
  const response = await request(app).get('/api/logger/test');

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.message, 'se generaron logs en todos los niveles');
});

test('GET /api/logger/error responde 400 y pasa por el middleware central', async () => {
  const response = await request(app).get('/api/logger/error');

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, 'TEST_LOGGER_ERROR');
  assert.ok(response.body.error.message.includes('logger test error'));
});
