const express = require('express');
const router = express.Router();

// Supported users — each entry has username, password, display name, college key
const USERS = [
  { username: 'srmktr', password: 'sk5Fe@y3Hqk', name: 'SRM KTR Administrator', college: 'srmktr' },
  { username: 'sret',   password: 'Sr3t@2026!',  name: 'SRET Administrator',    college: 'sret'   },
];

// Simple token (base64 encoded, no external JWT library needed)
const generateToken = (username, college) => {
  const payload = { username, college, iat: Date.now(), exp: Date.now() + 24 * 60 * 60 * 1000 };
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
  const match = USERS.find((u) => u.username === username && u.password === password);
  if (match) {
    const token = generateToken(match.username, match.college);
    return res.json({
      success: true,
      token,
      user: { username: match.username, name: match.name, college: match.college },
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
  const match = USERS.find((u) => u.username === payload.username);
  if (!match) return res.status(401).json({ success: false, error: 'User not found' });
  return res.json({
    success: true,
    user: { username: match.username, name: match.name, college: match.college },
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
