const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory stores (simple, for demo)
const shortCodeToUrl = new Map();
const userShortsByUsername = new Map();

// Config
const DEFAULT_USER = process.env.DEFAULT_USER || 'admin@winners.media';
const DEFAULT_PASS = process.env.DEFAULT_PASS || 'winners2025';
const SESSION_SECRET = process.env.SESSION_SECRET || 'winners-media-secret';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
}

// Auth endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === DEFAULT_USER && password === DEFAULT_PASS) {
    req.session.user = { username };
    return res.json({ ok: true, user: { username } });
  }
  return res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ ok: true, user: req.session.user });
  }
  return res.status(401).json({ ok: false });
});

// Shorten URL
app.post('/api/shorten', ensureAuth, (req, res) => {
  const { url, customCode } = req.body || {};
  try {
    if (!url) return res.status(400).json({ ok: false, error: 'URL_REQUIRED' });
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ ok: false, error: 'INVALID_URL' });
    }
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'INVALID_URL' });
  }

  let code;
  if (customCode) {
    code = String(customCode).trim();
    if (!/^[a-zA-Z0-9-_]{3,32}$/.test(code)) {
      return res.status(400).json({ ok: false, error: 'INVALID_CODE' });
    }
    if (shortCodeToUrl.has(code)) {
      return res.status(409).json({ ok: false, error: 'CODE_TAKEN' });
    }
  } else {
    do {
      code = nanoid(7);
    } while (shortCodeToUrl.has(code));
  }

  shortCodeToUrl.set(code, { url, createdAt: Date.now(), createdBy: req.session.user.username });

  const userKey = req.session.user.username;
  const list = userShortsByUsername.get(userKey) || [];
  list.unshift({ code, url, shortUrl: `${BASE_URL}/${code}`, createdAt: Date.now() });
  userShortsByUsername.set(userKey, list);

  return res.json({ ok: true, code, shortUrl: `${BASE_URL}/${code}` });
});

// List user URLs
app.get('/api/my-urls', ensureAuth, (req, res) => {
  const userKey = req.session.user.username;
  const list = userShortsByUsername.get(userKey) || [];
  res.json({ ok: true, urls: list });
});

// Redirect handler
app.get('/:code', (req, res, next) => {
  const { code } = req.params;
  if (code && shortCodeToUrl.has(code)) {
    const target = shortCodeToUrl.get(code).url;
    return res.redirect(target);
  }
  return next();
});

// Fallback to index.html for SPA routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Winners Media shortener running on ${BASE_URL}`);
});


