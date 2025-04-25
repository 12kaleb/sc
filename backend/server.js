const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');

// Routes
app.get('/', (req, res) => {
  res.send('School Portal Backend API');
});

app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/users');

const classRoutes = require('./routes/classes');

const assignmentRoutes = require('./routes/assignments');
const gradeRoutes = require('./routes/grades');

app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/grades', gradeRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
