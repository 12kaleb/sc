const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, role, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error in POST /users:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add new user (admin only) - adds authorized user without password (for signup)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required' });
  }
  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student or teacher' });
  }

  try {
    // Check if user exists
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Insert user with null password_hash to indicate authorized but not signed up
    const result = await db.query(
      'INSERT INTO users (email, role, password_hash) VALUES ($1, $2, NULL) RETURNING id, email, role',
      [email, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const userId = req.params.id;
  try {
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
