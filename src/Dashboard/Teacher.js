import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const API_BASE = 'http://localhost:5000/api';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAssignments(selectedClass);
    } else {
      setAssignments([]);
      setSubmissions([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (assignments.length > 0) {
      fetchSubmissions(assignments[0].id);
    } else {
      setSubmissions([]);
    }
  }, [assignments]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + '/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0].id);
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (classId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/assignments/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      setAssignments(data);
      if (data.length > 0) {
        fetchSubmissions(data[0].id);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      setAssignments([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/grades/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
  };

  const handleAssignmentSelect = (assignmentId) => {
    fetchSubmissions(assignmentId);
  };

  const openGradeDialog = (submission) => {
    setCurrentSubmission(submission);
    setGradeInput(submission.grade || '');
    setFeedbackInput(submission.feedback || '');
    setGradeDialogOpen(true);
  };

  const closeGradeDialog = () => {
    setGradeDialogOpen(false);
    setCurrentSubmission(null);
    setGradeInput('');
    setFeedbackInput('');
  };

  const handleGradeSubmit = async () => {
    if (!currentSubmission) return;
    try {
      const res = await fetch(`${API_BASE}/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignment_id: currentSubmission.assignment_id,
          student_id: currentSubmission.student_id,
          grade: gradeInput,
          feedback: feedbackInput,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit grade');
      setSnackbar({ open: true, message: 'Grade submitted successfully', severity: 'success' });
      closeGradeDialog();
      fetchSubmissions(currentSubmission.assignment_id);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Teacher Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Classes" icon={<ClassIcon />} />
        <Tab label="Grades" icon={<GradeIcon />} />
        <Tab label="Schedule" icon={<ScheduleIcon />} />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 2 }}
                startIcon={<AssignmentIcon />}
                // TODO: Implement create assignment
              >
                Create Assignment
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                startIcon={<PeopleIcon />}
                // TODO: Implement view students
              >
                View Students
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ClassIcon />}
                // TODO: Implement add new class
              >
                Add New Class
              </Button>
            </Paper>
          </Grid>

          {/* Upcoming Classes */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Your Classes
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <List>
                  {classes.map((cls) => (
                    <React.Fragment key={cls.id}>
                      <ListItem
                        button
                        onClick={() => handleClassSelect(cls.id)}
                        selected={selectedClass === cls.id}
                      >
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <ClassIcon />
                        </Avatar>
                        <ListItemText primary={cls.name} secondary={cls.time || ''} />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Student Submissions and Grades
          </Typography>
          {selectedClass ? (
            <>
              <Tabs
                value={assignments.length > 0 ? assignments[0].id : false}
                onChange={(e, val) => handleAssignmentSelect(val)}
                sx={{ mb: 2 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                {assignments.map((assignment) => (
                  <Tab key={assignment.id} label={assignment.title} value={assignment.id} />
                ))}
              </Tabs>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.student_id}>
                        <TableCell>{submission.student_name}</TableCell>
                        <TableCell>{submission.submitted ? 'Submitted' : 'Not Submitted'}</TableCell>
                        <TableCell>{submission.grade || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openGradeDialog(submission)}
                            disabled={!submission.submitted}
                          >
                            View/Edit Grade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography>Select a class to view submissions</Typography>
          )}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Weekly Schedule
          </Typography>
          {/* TODO: Implement schedule fetching and display */}
          <Typography>Schedule feature coming soon.</Typography>
        </Paper>
      )}

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onClose={closeGradeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          <TextField
            label="Grade"
            fullWidth
            value={gradeInput}
            onChange={(e) => setGradeInput(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Feedback"
            fullWidth
            multiline
            rows={4}
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGradeDialog}>Cancel</Button>
          <Button onClick={handleGradeSubmit} variant="contained" disabled={!gradeInput}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherDashboard;
