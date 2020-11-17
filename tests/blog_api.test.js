const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

const Blog = require('../models/blog');

// use npm test -- tests/blog_api.test.js to only run the tests in this file

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
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
  const newBlog = {
    title: 'Test blog',
    author: 'Me :sunglasses:',
    url: 'https://www.url.com/yeahlol',
    likes: 2077,
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
  const newBlog = {
    title: 'Test url 1',
    author: 'Me :sunglasses:',
    url: 'https://www.url.com/yeahlol',
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
  const newBlog = {
    author: 'Me :sunglasses:',
    likes: 2000,
  };

  await api.post('/api/blogs').send(newBlog).expect(400);
});

afterAll(() => {
  mongoose.connection.close();
});
