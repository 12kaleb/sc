const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get grades for a student (student only)
router.get('/student/:studentId', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const studentId = req.params.studentId;
  if (parseInt(studentId) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: can only view own grades' });
  }
  try {
    const result = await db.query(
      `SELECT submissions.assignment_id, assignments.title, submissions.grade, submissions.feedback
       FROM submissions
       JOIN assignments ON submissions.assignment_id = assignments.id
       WHERE submissions.student_id = $1`,
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit or update grade (teacher only)
router.post('/', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { assignment_id, student_id, grade, feedback } = req.body;
  if (!assignment_id || !student_id || !grade) {
    return res.status(400).json({ message: 'Assignment ID, student ID, and grade are required' });
  }
  try {
    // Check if submission exists
    const existing = await db.query(
      'SELECT * FROM submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignment_id, student_id]
    );
    if (existing.rows.length > 0) {
      // Update existing submission
      const result = await db.query(
        'UPDATE submissions SET grade = $1, feedback = $2, graded_at = NOW() WHERE assignment_id = $3 AND student_id = $4 RETURNING *',
        [grade, feedback || null, assignment_id, student_id]
      );
      res.json(result.rows[0]);
    } else {
      // Insert new submission with grade
      const result = await db.query(
        'INSERT INTO submissions (assignment_id, student_id, grade, feedback, graded_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [assignment_id, student_id, grade, feedback || null]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
