require('dotenv').config();

const { PORT } = process.env;
let { MONGODB_URI } = process.env; // === const MONGODB_URI = process.env.MONGODB_URI

// Si cambio test por development, al correr en npm run dev me conectaré a blog-app-test en vez de blog-app
if (process.env.NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI;
}

module.exports = {
  MONGODB_URI,
  PORT,
};
