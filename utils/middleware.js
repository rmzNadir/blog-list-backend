const chalk = require('chalk');
const logger = require('./logger');

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, req, res, next) => {
  logger.error(chalk.red(err.message));

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  if (err.name === 'ValidationError') {
    return res
      .status(400)
      .json({ error: `${err.name}: ${err.message}`, errorName: err.name }); // we send the error message as well as the error name so we can differentiate between multiple types of errors
  }
  return next(err);
};

module.exports = {
  unknownEndpoint,
  errorHandler,
};
