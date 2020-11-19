const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

const User = require('../models/user');

beforeEach(async () => {
  await User.deleteMany({});

  const userObjects = helper.initialUsers.map((user) => new User(user));
  const promiseArray = userObjects.map((user) => user.save());
  await Promise.all(promiseArray);
});

describe('User creation', () => {
  test('Succeeds with status code 200 if user is valid', async () => {
    const newUser = {
      username: 'dummyUser',
      name: 'User',
      password: 'dummypassword',
    };

    await api.post('/api/users').send(newUser).expect(200);
  });

  test("Fails with status code 400 if username isn't present", async () => {
    const newUser = {
      name: 'User',
      password: 'dummypassword',
    };

    await api.post('/api/users').send(newUser).expect(400, {
      error: 'missing username or password',
    });
  });

  test("Fails with status code 400 if password isn't present", async () => {
    const newUser = {
      username: 'dummyUser',
      name: 'User',
    };

    await api.post('/api/users').send(newUser).expect(400, {
      error: 'missing username or password',
    });
  });

  test("Fails with status code 400 if username's length isn't at least 3 characters long", async () => {
    const newUser = {
      username: 'du',
      password: 'dummypassword',
      name: 'User',
    };

    await api.post('/api/users').send(newUser).expect(400, {
      error: "username or password doesn't meet the length requirements",
    });
  });

  test("Fails with status code 400 if password's length isn't at least 3 characters long", async () => {
    const newUser = {
      username: 'dummyUser',
      password: 'du',
      name: 'User',
    };

    await api.post('/api/users').send(newUser).expect(400, {
      error: "username or password doesn't meet the length requirements",
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
