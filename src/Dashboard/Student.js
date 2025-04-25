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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

const API_BASE = 'http://localhost:5000/api';

const StudentDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAssignments();
    fetchGrades();
    fetchSchedule();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/assignments/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/grades/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch grades');
      const data = await res.json();
      setGrades(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/schedule/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch schedule');
      const data = await res.json();
      setSchedule(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenSubmitDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText('');
    setSubmissionFile(null);
    setOpenSubmitDialog(true);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    const formData = new FormData();
    formData.append('assignment_id', selectedAssignment.id);
    formData.append('submission_text', submissionText);
    if (submissionFile) {
      formData.append('submission_file', submissionFile);
    }
    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to submit assignment');
      setSnackbar({ open: true, message: 'Assignment submitted successfully', severity: 'success' });
      setOpenSubmitDialog(false);
      fetchAssignments();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Student Dashboard
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Assignments" icon={<AssignmentIcon />} />
        <Tab label="Grades" icon={<GradeIcon />} />
        <Tab label="Schedule" icon={<ScheduleIcon />} />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Your Assignments
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Assignment</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.subject}</TableCell>
                          <TableCell>{assignment.title}</TableCell>
                          <TableCell>{assignment.due}</TableCell>
                          <TableCell>
                            <Chip
                              label={assignment.status}
                              color={
                                assignment.status === 'Graded'
                                  ? 'success'
                                  : assignment.status === 'Submitted'
                                  ? 'primary'
                                  : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>{assignment.grade || '-'}</TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton color="primary">
                                <BookIcon />
                              </IconButton>
                            </Tooltip>
                            {assignment.status === 'Pending' && (
                              <Tooltip title="Submit">
                                <IconButton
                                  color="secondary"
                                  onClick={() => handleOpenSubmitDialog(assignment)}
                                >
                                  <UploadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Assignment Details
              </Typography>
              {selectedAssignment ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {selectedAssignment.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedAssignment.subject} • Due: {selectedAssignment.due}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedAssignment.description}
                  </Typography>
                  {selectedAssignment.status === 'Graded' && (
                    <Box
                      sx={{
                        backgroundColor: '#e8f5e9',
                        p: 2,
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Grade: {selectedAssignment.grade}
                      </Typography>
                      <Typography variant="body2">
                        Feedback: {selectedAssignment.feedback || 'No feedback provided.'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Select an assignment to view details
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Your Grades
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Assignments Completed</TableCell>
                    <TableCell>Average Grade</TableCell>
                    <TableCell>Last Assignment Grade</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell>{grade.subject}</TableCell>
                      <TableCell>{grade.assignments_completed}</TableCell>
                      <TableCell>{grade.average_grade}</TableCell>
                      <TableCell>{grade.last_grade}</TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" startIcon={<BookIcon />}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Weekly Schedule
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {schedule.map((day, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {day.day}
                    </Typography>
                    <List dense>
                      {day.classes.map((cls, clsIndex) => (
                        <ListItem key={clsIndex} sx={{ py: 0.5 }}>
                          <ListItemText primary={cls} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      <Dialog
        open={openSubmitDialog}
        onClose={() => setOpenSubmitDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Submit Assignment: {selectedAssignment?.title}
          <IconButton
            onClick={() => setOpenSubmitDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedAssignment?.description}
            </Typography>
            <TextField
              label="Your Submission Text"
              fullWidth
              multiline
              rows={4}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={(e) => setSubmissionFile(e.target.files[0])}
              />
            </Button>
            {submissionFile && (
              <Typography variant="body2">Selected file: {submissionFile.name}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitAssignment}
            variant="contained"
            disabled={!submissionText && !submissionFile}
          >
            Submit Assignment
          </Button>
        </DialogActions>
      </Dialog>

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

export default StudentDashboard;
