import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';

const createUserPayload = () => {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return {
    firstName: 'Ana',
    lastName: 'Gomez',
    email: `ana.${unique}@example.com`,
    password: 'Secret123!',
    role: 'user'
  };
};

describe('Functional - Users API', () => {
  it('GET /api/users devuelve listado con estructura esperada', async () => {
    const payload = createUserPayload();
    const createResponse = await request(app).post('/api/users').send(payload);
    expect(createResponse.status).to.equal(201);

    const response = await request(app).get('/api/users');

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      status: 'success',
      message: 'Usuarios obtenidos exitosamente'
    });
    expect(response.body.payload).to.be.an('array').with.length.greaterThan(0);
    expect(response.body.payload[0]).to.include.keys('_id', 'firstName', 'lastName', 'email', 'role');
    expect(response.body.payload[0]).to.not.have.property('password');
  });

  it('POST /api/users crea un usuario con datos válidos', async () => {
    const payload = createUserPayload();

    const response = await request(app).post('/api/users').send(payload);

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      status: 'success',
      message: 'Usuario creado exitosamente'
    });
    expect(response.body.payload).to.include.keys('_id', 'firstName', 'lastName', 'email', 'role');
    expect(response.body.payload.email).to.equal(payload.email);
    expect(response.body.payload).to.not.have.property('password');
  });

  it('GET /api/users/:id devuelve un usuario existente', async () => {
    const payload = createUserPayload();
    const createdUser = await request(app).post('/api/users').send(payload);

    const response = await request(app).get(`/api/users/${createdUser.body.payload._id}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.equal('Usuario obtenido exitosamente');
    expect(response.body.payload._id).to.equal(createdUser.body.payload._id);
    expect(response.body.payload.email).to.equal(payload.email);
  });

  it('GET /api/users/:id responde 404 cuando el usuario no existe', async () => {
    const response = await request(app).get(`/api/users/${new mongoose.Types.ObjectId().toString()}`);

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'USER_NOT_FOUND_ERROR',
      message: 'Usuario no encontrado'
    });
    expect(response.body.error.id).to.be.a('number');
  });

  it('POST /api/users responde 400 al faltar datos requeridos', async () => {
    const response = await request(app).post('/api/users').send({
      firstName: 'Sin',
      lastName: 'Email'
    });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'BAD_REQUEST_ERROR',
      message: 'Solicitud incorrecta'
    });
  });

  it('PUT /api/users/:id actualiza un usuario existente', async () => {
    const payload = createUserPayload();
    const createdUser = await request(app).post('/api/users').send(payload);

    const response = await request(app)
      .put(`/api/users/${createdUser.body.payload._id}`)
      .send({ firstName: 'Lucia', role: 'user' });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.equal('Usuario actualizado exitosamente');
    expect(response.body.payload.firstName).to.equal('Lucia');
    expect(response.body.payload.email).to.equal(payload.email);
  });

  it('PUT /api/users/:id responde 403 cuando intenta crear un admin', async () => {
    const payload = createUserPayload();
    const createdUser = await request(app).post('/api/users').send(payload);

    const response = await request(app)
      .put(`/api/users/${createdUser.body.payload._id}`)
      .send({ role: 'admin' });

    expect(response.status).to.equal(403);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'PERMISSION_DENIED_ERROR',
      message: 'Permiso denegado'
    });
  });

  it('DELETE /api/users/:id elimina un usuario existente', async () => {
    const payload = createUserPayload();
    const createdUser = await request(app).post('/api/users').send(payload);

    const response = await request(app).delete(`/api/users/${createdUser.body.payload._id}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.equal('Usuario eliminado exitosamente');
    expect(response.body.payload._id).to.equal(createdUser.body.payload._id);
  });

  it('DELETE /api/users/:id responde 404 cuando el usuario no existe', async () => {
    const response = await request(app).delete(`/api/users/${new mongoose.Types.ObjectId().toString()}`);

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.status).to.equal('fail');
    expect(response.body.error).to.include({
      code: 'USER_NOT_FOUND_ERROR',
      message: 'Usuario no encontrado'
    });
  });
});
