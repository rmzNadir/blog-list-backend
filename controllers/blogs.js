const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { blogsPosted: 0 });
  res.json(blogs);
});

blogsRouter.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog) {
    res.json(blog.toJSON());
  } else {
    res.status(404).end();
  }
});

blogsRouter.post('/', async (req, res) => {
  const user = await User.findById(req.body.userId);
  console.log('reqbody', req.body);
  const { title, author, url, likes } = req.body;

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes === undefined ? 0 : likes,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogsPosted = user.blogsPosted.concat(savedBlog._id);
  await user.save();

  res.json(savedBlog);
});

blogsRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const data = await Blog.findByIdAndUpdate(
    { _id: id },
    { $set: req.body },
    { new: true }
  );
  res.json({
    status: 200,
    msg: 'Blog updated',
    data: data,
  });
});

blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

module.exports = blogsRouter;
