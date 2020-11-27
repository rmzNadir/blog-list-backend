const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { blogsPosted: 0 });
  const sortedBlogs = blogs.sort((blogA, blogB) => blogB.likes - blogA.likes);
  res.json(sortedBlogs);
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
  const { token } = req;

  const decodedToken = jwt.verify(token, process.env.SECRET);

  // Unnecessary because error middleware execution takes places in first???
  // if (!token || !decodedToken.id) {
  //   return res.status(401).json({ error: 'token missing or invalid' });
  // }

  const user = await User.findById(decodedToken.id);

  const { title, author, url, likes } = req.body;

  const newBlog = new Blog({
    title,
    author,
    url,
    likes: likes === undefined ? 0 : likes,
    user: user._id,
  }).populate('user', { blogsPosted: 0 });

  const savedBlog = await newBlog.save();
  user.blogsPosted = user.blogsPosted.concat(savedBlog._id);
  await user.save();

  const blog = await Blog.findById(savedBlog.id).populate('user', {
    blogsPosted: 0,
  });

  return res.json(blog);
});

blogsRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;

  const data = await Blog.findByIdAndUpdate(
    { _id: id },
    { $set: req.body },
    { new: true }
  ).populate('user', { blogsPosted: 0 });
  return res.json({
    status: 200,
    success: true,
    msg: 'blog updated',
    data,
  });
});

blogsRouter.delete('/:id', async (req, res) => {
  const { token, params } = req;
  const { id } = params;

  const decodedToken = jwt.verify(token, process.env.SECRET);

  // Unnecessary because error middleware execution takes places in first???
  // if (!decodedToken.id) {
  //   return res.status(401).json({ error: 'token missing or invalid' });
  // }

  const BlogToDelete = await Blog.findById(id).populate('user', '_id');

  if (BlogToDelete.user._id.toString() === decodedToken.id.toString()) {
    await Blog.findByIdAndRemove(id);
    return res.json({
      status: 200,
      msg: "successfully deleted user's blog",
      success: true,
    });
  }
  return res.json({
    status: 403,
    error: "Insufficient permissions to delete another user's blog",
    success: false,
  });
});

module.exports = blogsRouter;
