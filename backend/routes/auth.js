const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
}

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password and role are required' });
  }

  try {
  // Check if user already signed up (password_hash NOT NULL)
  const userSignedUp = await db.query('SELECT * FROM users WHERE email = $1 AND password_hash IS NOT NULL', [email]);
  if (userSignedUp.rows.length > 0) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Check if email is authorized by admin (exists in users table with role but no password)
  const authorizedUser = await db.query('SELECT * FROM users WHERE email = $1 AND role = $2 AND password_hash IS NULL', [email, role]);
  if (authorizedUser.rows.length === 0) {
    return res.status(403).json({ message: 'Email not authorized for signup' });
  }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Update user with password_hash
    await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [password_hash, email]);

    const user = authorizedUser.rows[0];
    user.password_hash = password_hash;

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    if (!user.password_hash) {
      return res.status(403).json({ message: 'User has not set up a password yet' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
