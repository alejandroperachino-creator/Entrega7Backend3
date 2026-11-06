import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';
import User from '../src/models/user.model.js';

dotenv.config();

function buildUser() {
    const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    return {
        firstName: 'Jose',
        lastName: 'Perez',
        email: `jose.${unique}@example.com`,
        password: 'password123',
        role: 'user'
    };
}

describe('User Endpoint Tests', () => {
before(async () => {
    const mongoUri =
        process.env.MONGO_URI_TEST ||
        process.env.MONGODB_URI_TEST ||
        process.env.MONGO_URI ||
        process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error(
            'No hay URI de Mongo para tests. Configura MONGO_URI_TEST (o MONGODB_URI_TEST).'
        );
    }

    await mongoose.connect(mongoUri);
    await mongoose.connection.db.dropDatabase();
});

beforeEach(async () => {
    await User.deleteMany({});
});

after(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
});

it('POST /api/users crea un usuario', async () => {
    const response = await request(app).post('/api/users').send(buildUser());

    assert.equal(response.status, 201);
    assert.equal(response.body.status, 'success');
    assert.ok(response.body.payload?._id);
    assert.equal(response.body.payload.password, undefined);
});
});