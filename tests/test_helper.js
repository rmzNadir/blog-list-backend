const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'Inversion of Control',
    author: 'Kent C. Dodds',
    url: 'https://kentcdodds.com/blog/inversion-of-control',
    likes: 2077,
  },
  {
    title: "Understand JavaScript's this Keyword in Depth",
    author: 'Marius Schulz',
    url:
      'https://egghead.io/courses/understand-javascript-s-this-keyword-in-depth',
    likes: 2675,
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

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};
