const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get assignments for a class (admin, teacher, student)
router.get('/class/:classId', authenticateToken, authorizeRoles('admin', 'teacher', 'student'), async (req, res) => {
  const classId = req.params.classId;
  try {
    const result = await db.query(
      'SELECT * FROM assignments WHERE class_id = $1 ORDER BY due_date',
      [classId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment (teacher only)
router.post('/', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { class_id, title, description, due_date } = req.body;
  if (!class_id || !title) {
    return res.status(400).json({ message: 'Class ID and title are required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO assignments (class_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [class_id, title, description || null, due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assignment (teacher only)
router.put('/:id', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const assignmentId = req.params.id;
  const { title, description, due_date } = req.body;
  try {
    const result = await db.query(
      'UPDATE assignments SET title = $1, description = $2, due_date = $3 WHERE id = $4 RETURNING *',
      [title, description || null, due_date || null, assignmentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete assignment (teacher only)
router.delete('/:id', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const assignmentId = req.params.id;
  try {
    await db.query('DELETE FROM assignments WHERE id = $1', [assignmentId]);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
