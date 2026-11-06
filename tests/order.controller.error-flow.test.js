import test from 'node:test';
import assert from 'node:assert/strict';

import OrderController from '../src/controllers/order.controller.js';

class FakeOrderService {
  async getAll() {
    throw Object.assign(new Error('Orden no encontrada'), { statusCode: 404, code: 'NOT_FOUND' });
  }
}

test('order controller forwards service errors to next instead of responding directly', async () => {
  const controller = new OrderController(new FakeOrderService());
  let called = false;

  const req = { query: {} };
  const res = {
    status: () => {
      throw new Error('Controller should not handle errors directly');
    },
    json: () => {
      throw new Error('Controller should not handle errors directly');
    }
  };
  const next = (error) => {
    called = true;
    assert.equal(error.message, 'Orden no encontrada');
  };

  await controller.getAll(req, res, next);
  assert.equal(called, true);
});
