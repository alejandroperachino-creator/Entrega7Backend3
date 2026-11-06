import test from 'node:test';
import assert from 'node:assert/strict';

import MockService from '../src/services/mock.service.js';
import { ErrorDictionary } from '../src/utils/errors.js';

test('mock service rejects non-numeric qty with INVALID_TYPE_ERROR', async () => {
  const service = new MockService();

  await assert.rejects(
    service.getUsers('abc'),
    (error) => {
      assert.equal(error.name, ErrorDictionary.INVALID_TYPE_ERROR.name);
      assert.equal(error.code, ErrorDictionary.INVALID_TYPE_ERROR.code);
      assert.equal(error.statusCode, ErrorDictionary.INVALID_TYPE_ERROR.status);
      assert.equal(error.message, 'La cantidad de mocks debe ser un numero entero positivo mayor a cero.');
      return true;
    }
  );
});

test('mock service rejects negative qty with INVALID_TYPE_ERROR', async () => {
  const service = new MockService();

  await assert.rejects(
    service.getUsers(-5),
    (error) => {
      assert.equal(error.name, ErrorDictionary.INVALID_TYPE_ERROR.name);
      assert.equal(error.code, ErrorDictionary.INVALID_TYPE_ERROR.code);
      assert.equal(error.statusCode, ErrorDictionary.INVALID_TYPE_ERROR.status);
      assert.equal(error.message, 'La cantidad de mocks debe ser un numero entero positivo mayor a cero.');
      return true;
    }
  );
});
