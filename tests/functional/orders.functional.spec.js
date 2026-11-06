import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { ORDER_STATUS } from '../../src/constants/index.js';

const createUserPayload = () => {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return {
    firstName: 'Leo',
    lastName: 'Perez',
    email: `leo.${unique}@example.com`,
    password: 'Secret123!',
    role: 'user'
  };
};

const createOrderPayload = (customerId) => ({
  customer: customerId,
  deliveryAddress: 'Calle Falsa 123',
  items: [
    { name: 'Caja mediana', quantity: 2, price: 1500 }
  ]
});

describe('Functional - Orders API', () => {
  it('GET /api/orders devuelve listado de pedidos', async () => {
    const userResponse = await request(app).post('/api/users').send(createUserPayload());
    const customerId = userResponse.body.payload._id;

    const createOrderResponse = await request(app)
      .post('/api/orders')
      .send(createOrderPayload(customerId));
    expect(createOrderResponse.status).to.equal(201);

    const response = await request(app).get('/api/orders');

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.payload).to.be.an('array').with.length(1);
    expect(response.body.payload[0]).to.include.keys('_id', 'customer', 'items', 'status', 'priority', 'total');
  });

  it('POST /api/orders crea un pedido con datos válidos', async () => {
    const userResponse = await request(app).post('/api/users').send(createUserPayload());
    const customerId = userResponse.body.payload._id;

    const response = await request(app)
      .post('/api/orders')
      .send(createOrderPayload(customerId));

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      status: 'success',
      message: 'Orden creada exitosamente'
    });
    expect(response.body.payload).to.include.keys(
      '_id',
      'customer',
      'items',
      'deliveryAddress',
      'status',
      'priority',
      'shippingCost',
      'declaredValue',
      'total'
    );
  });

  it('GET /api/orders/:id obtiene un pedido existente', async () => {
    const userResponse = await request(app).post('/api/users').send(createUserPayload());
    const customerId = userResponse.body.payload._id;

    const createdOrder = await request(app)
      .post('/api/orders')
      .send(createOrderPayload(customerId));
    const orderId = createdOrder.body.payload._id;

    const response = await request(app).get(`/api/orders/${orderId}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.payload).to.include.keys('_id', 'customer', 'items', 'status');
    expect(response.body.payload._id).to.equal(orderId);
  });

  it('PUT /api/orders/:id actualiza estado con valor válido', async () => {
    const userResponse = await request(app).post('/api/users').send(createUserPayload());
    const customerId = userResponse.body.payload._id;

    const createdOrder = await request(app)
      .post('/api/orders')
      .send(createOrderPayload(customerId));
    const orderId = createdOrder.body.payload._id;

    const response = await request(app).put(`/api/orders/${orderId}`).send({
      status: ORDER_STATUS.ASSIGNED
    });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.payload.status).to.equal(ORDER_STATUS.ASSIGNED);
  });

  it('POST /api/orders responde 400 con datos incompletos', async () => {
    const response = await request(app).post('/api/orders').send({
      deliveryAddress: 'Sin cliente ni items'
    });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'BAD_REQUEST_ERROR',
      message: 'Solicitud incorrecta'
    });
    expect(response.body.error.id).to.be.a('number');
  });

  it('GET /api/orders/:id responde 404 cuando el recurso no existe', async () => {
    const response = await request(app).get(`/api/orders/${new mongoose.Types.ObjectId().toString()}`);

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'ORDER_NOT_FOUND_ERROR',
      message: 'Orden no encontrada'
    });
    expect(response.body.error.id).to.be.a('number');
  });

  it('PUT /api/orders/:id responde 400 con estado inválido', async () => {
    const userResponse = await request(app).post('/api/users').send(createUserPayload());
    const customerId = userResponse.body.payload._id;

    const createdOrder = await request(app)
      .post('/api/orders')
      .send(createOrderPayload(customerId));
    const orderId = createdOrder.body.payload._id;

    const response = await request(app).put(`/api/orders/${orderId}`).send({
      status: 'estado_invalido'
    });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error.code).to.equal('VALIDATION_ERROR');
    expect(response.body.error.message).to.include('status');
    expect(response.body.error.id).to.be.a('number');
  });
});
