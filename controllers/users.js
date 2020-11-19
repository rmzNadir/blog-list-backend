const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

// Create a new user

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body;

  if (!(username && password)) {
    return res.status(400).json({
      error: 'missing username or password',
    });
  }

  if (username.length < 3 || password.length < 3) {
    return res.status(400).json({
      error: "username or password doesn't meet the length requirements",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  return res.json(savedUser);
});

// Get all users

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogsPosted', { user: 0 });
  res.json(users);
});

module.exports = usersRouter;
