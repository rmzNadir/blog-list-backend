const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

// use npm test -- tests/blog_api.test.js to only run the tests in this file

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const blogPromiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(blogPromiseArray);

  await User.deleteMany({});

  const userObjects = helper.initialUsers.map((user) => new User(user));
  const UserPromiseArray = userObjects.map((user) => user.save());
  await Promise.all(UserPromiseArray);
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

test('a valid blog can be added', async () => {
  const users = await helper.usersInDb();

  const newBlog = {
    title: 'Test blog',
    author: 'Me :sunglasses:',
    url: 'https://www.url.com/yeahlol',
    likes: 2077,
    userId: users[0].id,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const titles = blogsAtEnd.map((b) => b.title);

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  expect(titles).toContain('Test blog');
});

test('blog without likes is defaulted to 0', async () => {
  const users = await helper.usersInDb();

  const newBlog = {
    title: 'Test url 1',
    author: 'Me :sunglasses:',
    url: 'https://www.url.com/yeahlol',
    userId: users[0].id,
  };

  await api.post('/api/blogs').send(newBlog).expect(200);

  const blogsAtEnd = await helper.blogsInDb();
  const uploadedBlogLikes = blogsAtEnd.filter(
    (blog) => blog.title === 'Test url 1'
  )[0].likes;
  expect(uploadedBlogLikes).toEqual(0);
  expect(uploadedBlogLikes).toBeDefined();
});

test("blog won't save if title or url are missing", async () => {
  const users = await helper.usersInDb();

  const newBlog = {
    author: 'Me :sunglasses:',
    likes: 2000,
    userId: users[0].id,
  };

  await api.post('/api/blogs').send(newBlog).expect(400);
});

describe('Deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogs = await helper.blogsInDb();
    const blogsToDelete = blogs[0];

    await api.delete(`/api/blogs/${blogsToDelete.id}`).expect(204);

    const blogsAfterCall = await helper.blogsInDb();

    expect(blogsAfterCall).toHaveLength(helper.initialBlogs.length - 1);

    const titles = blogsAfterCall.map((blog) => blog.title);

    expect(titles).not.toContain(blogsToDelete.title);
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
