const express = require('express');
const router = express.Router();

// Hardcoded credentials
const VALID_USER = {
  username: 'srmktr',
  password: 'sk5Fe@y3Hqk',
  name: 'Administrator',
};

// Simple token (base64 encoded, no external JWT library needed)
const generateToken = (username) => {
  const payload = { username, iat: Date.now(), exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const verifyToken = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (username === VALID_USER.username && password === VALID_USER.password) {
    const token = generateToken(username);
    return res.json({
      success: true,
      token,
      user: { username: VALID_USER.username, name: VALID_USER.name },
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// GET /api/auth/verify
router.get('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
  return res.json({
    success: true,
    user: { username: VALID_USER.username, name: VALID_USER.name },
  });
});

// Auth middleware for protecting routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
  req.user = payload;
  next();
};

module.exports = { authRouter: router, authMiddleware };
