import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserRepositoryFactory from '../src/repositories/user.repository.js';
import User from '../src/models/user.model.js';

dotenv.config();

const UserRepository = UserRepositoryFactory();

function buildUserData(overrides = {}) {
    const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    return {
        firstName: 'Jose',
        lastName: 'Perez',
        email: `jose.${unique}@gmail.com`,
        password: 'password123',
        ...overrides
    };
}

async function clearUsers() {
    await User.deleteMany({});
}

test.before(async () => {
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

test.beforeEach(async () => {
    await clearUsers();
});

test.after(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
});

test('create crea un usuario y omite password en la respuesta', async () => {
    const created = await UserRepository.create(buildUserData());

    assert.ok(created?._id);
    assert.equal(created.password, undefined);
    assert.equal(created.__v, undefined);
});

test('findByEmail encuentra usuario ignorando mayúsculas y espacios', async () => {
    const userData = buildUserData({ email: 'juan.perez@gmail.com' });
    await UserRepository.create(userData);

    const found = await UserRepository.findByEmail('  JUAN.PEREZ@GMAIL.COM  ');

    assert.ok(found?._id);
    assert.equal(found.email, 'juan.perez@gmail.com');
});

test('findById devuelve usuario sin password', async () => {
    const created = await UserRepository.create(buildUserData());

    const found = await UserRepository.findById(created._id);

    assert.ok(found?._id);
    assert.equal(found.password, undefined);
});

test('findRawById devuelve usuario con password', async () => {
    const userData = buildUserData();
    const created = await UserRepository.create(userData);

    const foundRaw = await UserRepository.findRawById(created._id);

    assert.ok(foundRaw?._id);
    assert.equal(foundRaw.password, userData.password);
});

test('findAll aplica filtro y omite password', async () => {
    await UserRepository.create(buildUserData({ role: 'user' }));
    await UserRepository.create(buildUserData({ role: 'admin' }));

    const admins = await UserRepository.findAll({ role: 'admin' });

    assert.equal(admins.length, 1);
    assert.equal(admins[0].role, 'admin');
    assert.equal(admins[0].password, undefined);
});

test('updateById actualiza y devuelve documento sin password', async () => {
    const created = await UserRepository.create(buildUserData({ firstName: 'Jose' }));

    const updated = await UserRepository.updateById(created._id, { firstName: 'Pedro' });

    assert.ok(updated?._id);
    assert.equal(updated.firstName, 'Pedro');
    assert.equal(updated.password, undefined);
});

test('deleteById elimina el usuario', async () => {
    const created = await UserRepository.create(buildUserData());

    const deleted = await UserRepository.deleteById(created._id);
    const foundAfterDelete = await UserRepository.findRawById(created._id);

    assert.ok(deleted?._id);
    assert.equal(foundAfterDelete, null);
});