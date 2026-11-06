import { faker } from '@faker-js/faker';
import { USER_ROLES } from '../constants/index.js';

const mockeableRoles = [USER_ROLES.USER, USER_ROLES.DRIVER, USER_ROLES.STORE];
const rolePrefix = {
  [USER_ROLES.USER]: 'usr',
  [USER_ROLES.DRIVER]: 'drv',
  [USER_ROLES.STORE]: 'str'
};

function applySeed(seed) {
  if (seed === undefined || seed === null || seed === '') {
    return;
  }

  faker.seed(Number(seed));
}

function resolveRole(requestedRole) {
  if (requestedRole && mockeableRoles.includes(requestedRole)) {
    return requestedRole;
  }

  return faker.helpers.arrayElement(mockeableRoles);
}

export const generatemockuser = (roleInput, seed) => {
  applySeed(seed);

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const role = resolveRole(roleInput);
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const prefix = rolePrefix[role] || 'usr';

  return {
    id: `${prefix}_${faker.string.uuid()}`,
    firstName,
    lastName,
    email,
    role,
    password: 'Coderhouse123',
    address: faker.location.streetAddress(),
    isAvailable: role === USER_ROLES.DRIVER ? faker.datatype.boolean() : undefined
  };
};

export const generatemockusers = (qty = 1, roleInput, seed) => {
  const usersData = [];
  for (let i = 0; i < qty; i += 1) {
    const nextSeed = seed === undefined || seed === null || seed === '' ? undefined : Number(seed) + i;
    usersData.push(generatemockuser(roleInput, nextSeed));
  }

  return usersData;
};




