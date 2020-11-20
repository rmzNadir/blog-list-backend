const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

// use npm test -- tests/blog_api.test.js to only run the tests in this file

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  const UserPromiseArray = helper.initialUsers.map(async (user) =>
    api.post('/api/users').send(user)
  );
  await Promise.all(UserPromiseArray);

  const dummyUserCredentials = {
    username: 'rmzNadir',
    password: 'dummyPassword',
  };
  const userLogin = await api.post('/api/login').send(dummyUserCredentials);

  const blogPromiseArray = helper.initialBlogs.map(async (blog) =>
    api
      .post('/api/blogs')
      .send(blog)
      .set('Authorization', `Bearer ${userLogin.body.token}`)
  );
  await Promise.all(blogPromiseArray);
});

test('the 2 blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('check if _id was replaced by id', async () => {
  const response = await api.get('/api/blogs');

  const blog = response.body[0];

  expect(blog.id).toBeDefined();
  expect(blog._id).toBeUndefined();
});

test("a valid blog won't be added if there's no bearer token present", async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Me :sunglasses:',
    url: 'https://www.url.com/yeahlol',
    likes: 2077,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const titles = blogsAtEnd.map((b) => b.title);

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

  expect(titles).not.toContain('Test blog');
});

test('a valid blog can be added', async () => {
  const dummyUserCredentials = {
    username: 'rmzNadir',
    password: 'dummyPassword',
  };

  const newBlog = {
    title: 'Test blog',
    author: 'Me :sunglasses:',
    url: 'https://www.url.com/yeahlol',
    likes: 2077,
  };

  const userLogin = await api
    .post('/api/login')
    .send(dummyUserCredentials)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  // console.log('response', userLogin.body);

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${userLogin.body.token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const titles = blogsAtEnd.map((b) => b.title);

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  expect(titles).toContain('Test blog');
});

test('blog without likes is defaulted to 0', async () => {
  const dummyUserCredentials = {
    username: 'rmzNadir',
    password: 'dummyPassword',
  };

  const newBlog = {
    title: 'Test url 1',
    author: 'Me :sunglasses:',
    url: 'https://www.url.com/yeahlol',
  };

  const userLogin = await api
    .post('/api/login')
    .send(dummyUserCredentials)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${userLogin.body.token}`)
    .expect(200);

  const blogsAtEnd = await helper.blogsInDb();
  const uploadedBlogLikes = blogsAtEnd.filter(
    (blog) => blog.title === 'Test url 1'
  )[0].likes;
  expect(uploadedBlogLikes).toEqual(0);
  expect(uploadedBlogLikes).toBeDefined();
});

test("blog won't save if title or url are missing", async () => {
  const dummyUserCredentials = {
    username: 'rmzNadir',
    password: 'dummyPassword',
  };

  const newBlog = {
    author: 'Me :sunglasses:',
    likes: 2000,
  };

  const userLogin = await api
    .post('/api/login')
    .send(dummyUserCredentials)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${userLogin.body.token}`)
    .expect(400);
});

describe('Deletion of a blog', () => {
  test('succeeds with status code 200 if token is valid and the token owner is the same as the blog owner', async () => {
    const dummyUserCredentials = {
      username: 'rmzNadir',
      password: 'dummyPassword',
    };

    const userLogin = await api
      .post('/api/login')
      .send(dummyUserCredentials)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogs = await helper.blogsInDb();
    console.log('blogs', blogs);

    await api
      .delete(`/api/blogs/${blogs[0].id}`)
      .set('Authorization', `Bearer ${userLogin.body.token}`)
      .expect(200);

    const blogsAfterCall = await helper.blogsInDb();

    expect(blogsAfterCall).toHaveLength(helper.initialBlogs.length - 1);

    const titles = blogsAfterCall.map((blog) => blog.title);

    expect(titles).not.toContain(blogs[0].title);
  });
});

describe('Update of a specific blog', () => {
  test('succeeds with status code 200 if successfully updated', async () => {
    const blogs = await helper.blogsInDb();

    const titles = blogs.map((blog) => blog.title);

    const updatedBlog = {
      title: 'Updated blog title',
      author: 'Kent C. Dodds',
      url: 'https://kentcdodds.com/blog/inversion-of-control',
      likes: 2078,
      id: blogs[0].id,
    };

    await api
      .patch(`/api/blogs/${updatedBlog.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAfterCall = await helper.blogsInDb();

    const titlesAfterCall = blogsAfterCall.map((blog) => blog.title);

    expect(titles).not.toContain(updatedBlog.title);
    expect(titlesAfterCall).not.toContain(blogs[0].title);
    expect(titlesAfterCall).toContain(updatedBlog.title);
    expect(blogsAfterCall[0].likes).toEqual(updatedBlog.likes);
  });
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
