const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
  {
    title: 'Inversion of Control',
    author: 'Kent C. Dodds',
    url: 'https://kentcdodds.com/blog/inversion-of-control',
    likes: 2077,
    userId: '5fb60895590c702e867aa436',
  },
  {
    title: "Understand JavaScript's this Keyword in Depth",
    author: 'Marius Schulz',
    url:
      'https://egghead.io/courses/understand-javascript-s-this-keyword-in-depth',
    likes: 2675,
    userId: '5fb60895590c702e867aa436',
  },
];

const initialUsers = [
  {
    username: 'rmzNadir',
    name: 'Diego González',
    password: 'dummypassword',
  },
  {
    username: 'Kok0n0',
    name: 'Diego Ramírez',
    id: 'dummypassword',
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'Inversion of Control',
    author: 'Kent C. Dodds',
    url: 'https://kentcdodds.com/blog/inversion-of-control',
    likes: 2077,
  });
  await blog.save();
  await blog.remove();

  return blog.id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});

  return users.map((user) => user.toJSON());
};

module.exports = {
  initialUsers,
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
