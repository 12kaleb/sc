const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all classes (admin and teacher)
router.get('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT classes.id, classes.name, users.email as teacher_email
       FROM classes
       LEFT JOIN users ON classes.teacher_id = users.id
       ORDER BY classes.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new class (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, teacher_id } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Class name is required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO classes (name, teacher_id) VALUES ($1, $2) RETURNING *',
      [name, teacher_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update class (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const classId = req.params.id;
  const { name, teacher_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE classes SET name = $1, teacher_id = $2 WHERE id = $3 RETURNING *',
      [name, teacher_id || null, classId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete class (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const classId = req.params.id;
  try {
    await db.query('DELETE FROM classes WHERE id = $1', [classId]);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
