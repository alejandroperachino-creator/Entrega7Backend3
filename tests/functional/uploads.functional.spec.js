import { expect } from 'chai';
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

describe('Functional - Uploads', () => {
  it('POST /api/users/:id/documents carga un documento válido', async () => {
    const userPayload = createUserPayload();
    const userResponse = await request(app).post('/api/users').send(userPayload);
    expect(userResponse.status).to.equal(201);

    const response = await request(app)
      .post(`/api/users/${userResponse.body.payload._id}/documents`)
      .field('type', 'dni')
      .attach('document', Buffer.from('fake pdf content'), {
        filename: 'dni.pdf',
        contentType: 'application/pdf'
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      status: 'success',
      message: 'Documento subido exitosamente'
    });
    expect(response.body.payload.documents).to.have.length.greaterThan(0);
    expect(response.body.payload.documents[0].document.type).to.equal('dni');
  });

  it('POST /api/users/:id/documents falla cuando falta el archivo', async () => {
    const userPayload = createUserPayload();
    const userResponse = await request(app).post('/api/users').send(userPayload);
    const response = await request(app)
      .post(`/api/users/${userResponse.body.payload._id}/documents`)
      .field('type', 'dni');

    expect(response.status).to.equal(400);
    expect(response.body.error.code).to.equal('MISSING_FILE');
  });

  it('POST /api/users/:id/documents falla con tipo de documento inválido', async () => {
    const userPayload = createUserPayload();
    const userResponse = await request(app).post('/api/users').send(userPayload);

    const response = await request(app)
      .post(`/api/users/${userResponse.body.payload._id}/documents`)
      .field('type', 'tipo-invalido')
      .attach('document', Buffer.from('fake pdf content'), {
        filename: 'dni.pdf',
        contentType: 'application/pdf'
      });

    expect(response.status).to.equal(400);
    expect(response.body.error.code).to.equal('INVALID_DOCUMENT_TYPE');
  });

  it('POST /api/deliveries/:id/proof falla cuando la entidad no existe', async () => {
    const response = await request(app)
      .post('/api/deliveries/507f1f77bcf86cd799439011/proof')
      .attach('proof', Buffer.from('fake pdf content'), {
        filename: 'proof.pdf',
        contentType: 'application/pdf'
      });

    expect(response.status).to.equal(404);
    expect(response.body.error.code).to.equal('DELIVERY_NOT_FOUND_ERROR');
  });
});
