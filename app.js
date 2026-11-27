const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const methodOverride = require('method-override');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

const csrf = require('./middleware/csrf');
const flash = require('./middleware/flash');
const { loadUser } = require('./middleware/auth');

function renderMarkdown(text) {
  const html = marked.parse(String(text || ''), { breaks: true, gfm: true });
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.filter((t) => t !== 'img'),
    allowedAttributes: { a: ['href', 'title'], code: ['class'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }),
    },
  });
}

function createApp({ mongoUrl, sessionSecret, isProd }) {
  const app = express();

  if (isProd) app.set('trust proxy', 1); // Render / Railway sit behind a proxy
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", 'https://cdn.jsdelivr.net'],
          scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
          fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:'],
          formAction: ["'self'"],
          upgradeInsecureRequests: isProd ? [] : null,
        },
      },
    })
  );

  app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '7d' : 0 }));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));

  app.use(
    session({
      name: 'connect.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl, ttl: 60 * 60 * 24 * 7 }),
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.use(flash);
  app.use(csrf);
  app.use(methodOverride('_method')); // forms POST to ?_method=PUT|DELETE (after CSRF check on body)
  app.use(loadUser);

  app.locals.renderMarkdown = renderMarkdown;
  app.locals.formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  app.locals.excerpt = (text, n = 160) => {
    const plain = String(text || '')
      .replace(/[`*_>#\[\]()!-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return plain.length > n ? `${plain.slice(0, n).trimEnd()}…` : plain;
  };

  app.get('/', (req, res) => res.redirect('/posts'));
  app.get('/tags/:tag', (req, res) => res.redirect(`/posts?tag=${encodeURIComponent(req.params.tag)}`));
  app.use('/api', require('./routes/api'));
  app.use('/', require('./routes/auth'));
  app.use('/posts', require('./routes/posts'));

  app.use((req, res, next) => {
    const err = new Error('Page not found');
    err.status = 404;
    next(err);
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    let status = err.status || 500;
    if (err.name === 'CastError') status = 404;
    if (status >= 500) console.error(err);
    const message = status >= 500 && isProd ? 'Something went wrong on our side.' : err.message;
    res.status(status).render('error', {
      title: `Error ${status}`,
      status,
      message,
      currentUser: res.locals.currentUser || null,
      csrfToken: res.locals.csrfToken || '',
      flash: null,
    });
  });

  return app;
}

module.exports = { createApp, renderMarkdown };
