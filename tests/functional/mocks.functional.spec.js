import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';

describe('Functional - Mocks API', () => {
  it('GET /api/mocks/users genera mocks válidos y repetibles por seed', async () => {
    const firstResponse = await request(app).get('/api/mocks/users').query({ qty: 2, seed: 123 });
    const secondResponse = await request(app).get('/api/mocks/users').query({ qty: 2, seed: 123 });

    expect(firstResponse.status).to.equal(200);
    expect(firstResponse.body.status).to.equal('success');
    expect(firstResponse.body.payload).to.be.an('array').with.length(2);
    expect(firstResponse.body.payload[0]).to.include.keys('firstName', 'lastName', 'email', 'password', 'role');

    const pickStableFields = (users) => users.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      address: user.address
    }));

    expect(pickStableFields(firstResponse.body.payload)).to.deep.equal(pickStableFields(secondResponse.body.payload));
    firstResponse.body.payload.forEach((user) => {
      expect(user.password).to.be.a('string');
      expect(user.password.startsWith('$2')).to.equal(true);
    });
  });

  it('GET /api/mocks/users responde 400 si qty es inválido', async () => {
    const response = await request(app).get('/api/mocks/users').query({ qty: 'abc' });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'INVALID_TYPE_ERROR',
      message: 'La cantidad de mocks debe ser un numero entero positivo mayor a cero.'
    });
    expect(response.body.error.id).to.be.a('number');
  });

  it('GET /api/mocks/orders genera pedidos mock con estructura esperada', async () => {
    const response = await request(app).get('/api/mocks/orders').query({ qty: 2, seed: 321 });

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      status: 'success',
      message: 'Pedidos mock generados'
    });
    expect(response.body.payload).to.be.an('array').with.length(2);
    expect(response.body.payload[0]).to.include.keys(
      'id',
      'customer',
      'items',
      'deliveryAddress',
      'total',
      'status',
      'priority'
    );
    expect(response.body.payload[0].items).to.be.an('array').with.length.greaterThan(0);
    expect(response.body.payload[0].items[0]).to.include.keys('name', 'quantity', 'price');
  });

  it('GET /api/mocks/orders responde 400 si qty es inválido', async () => {
    const response = await request(app).get('/api/mocks/orders').query({ qty: 0 });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'INVALID_TYPE_ERROR',
      message: 'La cantidad de mocks debe ser un numero entero positivo mayor a cero.'
    });
    expect(response.body.error.id).to.be.a('number');
  });

  it('GET /api/mocks/snapshot genera un snapshot completo', async () => {
    const response = await request(app).get('/api/mocks/snapshot').query({ users: 2, orders: 2, deliveries: 2, seed: 777 });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.payload).to.include.keys('users', 'orders', 'deliveries');
    expect(response.body.payload.users).to.be.an('array').with.length(2);
    expect(response.body.payload.orders).to.be.an('array').with.length(2);
    expect(response.body.payload.deliveries).to.be.an('array').with.length(2);
  });

  it('POST /api/mocks/seed responde 400 si la colección es inválida', async () => {
    const response = await request(app).post('/api/mocks/seed').query({ qty: 2, collection: 'coleccion-invalida' });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'BAD_REQUEST_ERROR',
      message: 'Coleccion invalida. Valores permitidos: users, orders, deliveries, all'
    });
    expect(response.body.error.id).to.be.a('number');
  });
});
