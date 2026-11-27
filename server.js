require('dotenv').config();
const mongoose = require('mongoose');
const { createApp } = require('./app');
const Post = require('./models/Post');

const isProd = process.env.NODE_ENV === 'production';
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';
const sessionSecret = process.env.SESSION_SECRET || (isProd ? '' : 'dev-only-secret-change-me');
const port = process.env.PORT || 3000;

if (!sessionSecret) {
  console.error('SESSION_SECRET must be set in production.');
  process.exit(1);
}

mongoose
  .connect(mongoUrl)
  .then(async () => {
    await Post.init(); // make sure indexes (incl. the text index) exist
    createApp({ mongoUrl, sessionSecret, isProd }).listen(port, () =>
      console.log(`CampusConnect running on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
