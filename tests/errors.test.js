import test from 'node:test';
import assert from 'node:assert/strict';

import { CustomError, ErrorDictionary, createError } from '../src/utils/errors.js';
import { globalErrorHandler } from '../src/middlewares/globalErrorHandler.js';
import OrderService from '../src/services/order.service.js';
import UserController from '../src/controllers/user.controller.js';

test('CustomError crea un error con estructura estándar', () => {
  const error = new CustomError({
    name: ErrorDictionary.BAD_REQUEST_ERROR.name,
    message: 'qty inválido',
    code: ErrorDictionary.BAD_REQUEST_ERROR.code,
    statusCode: ErrorDictionary.BAD_REQUEST_ERROR.status,
    details: { received: -1 }
  });

  assert.equal(error.name, ErrorDictionary.BAD_REQUEST_ERROR.name);
  assert.equal(error.message, 'qty inválido');
  assert.equal(error.code, ErrorDictionary.BAD_REQUEST_ERROR.code);
  assert.equal(error.statusCode, ErrorDictionary.BAD_REQUEST_ERROR.status);
  assert.deepEqual(error.details, { received: -1 });
});

test('createError mantiene compatibilidad con el patrón anterior', () => {
  const error = createError(
    ErrorDictionary.VALIDATION_ERROR.name,
    'Dato inválido',
    ErrorDictionary.VALIDATION_ERROR.status,
    ErrorDictionary.VALIDATION_ERROR.code
  );

  assert.equal(error.name, ErrorDictionary.VALIDATION_ERROR.name);
  assert.equal(error.message, 'Dato inválido');
  assert.equal(error.statusCode, ErrorDictionary.VALIDATION_ERROR.status);
  assert.equal(error.code, ErrorDictionary.VALIDATION_ERROR.code);
});

test('globalErrorHandler normaliza errores con un único formato de respuesta', () => {
  const res = {
    statusCode: null,
    payload: null,
    headersSent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  globalErrorHandler({ name: 'CastError', message: 'Cast to ObjectId failed' }, {}, res, () => {});

  assert.equal(res.statusCode, ErrorDictionary.INVALID_ID_ERROR.status);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.error.code, ErrorDictionary.INVALID_ID_ERROR.code);
  assert.equal(res.payload.error.message, ErrorDictionary.INVALID_ID_ERROR.message);
});

test('order service calculates shipping cost without apiKey dependency', () => {
  const service = new OrderService();

  assert.equal(service.calculateShippingCost({ isProduction: false, shipmentValue: 2000 }), 10);
  assert.equal(service.calculateShippingCost({ isProduction: true, shipmentValue: 2000 }), 70);
});

test('user controller keeps its service bound when used as a route handler', async () => {
  const controller = UserController;
  const createdUser = { id: 'u-1', firstName: 'Ana', lastName: 'Gomez', email: 'ana@example.com' };

  controller.userService.createUser = async () => createdUser;

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  const next = () => {};
  const createHandler = controller.create;

  await createHandler({ body: { firstName: 'Ana', lastName: 'Gomez', email: 'ana@example.com', password: '123456' } }, res, next);

  assert.equal(res.statusCode, 201);
  assert.equal(res.payload.status, 'success');
  assert.equal(res.payload.payload.id, 'u-1');
});
