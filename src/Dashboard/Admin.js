import React, { useState,  useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const API_BASE = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Students', value: '1,245', icon: <PeopleIcon />, color: 'primary' },
    { title: 'Total Teachers', value: '48', icon: <SchoolIcon />, color: 'secondary' },
    { title: 'Active Classes', value: '32', icon: <AssessmentIcon />, color: 'success' }
  ];

  const recentActivities = [
    { action: 'New student registration', time: '10 minutes ago' },
    { action: 'Teacher account created', time: '25 minutes ago' },
    { action: 'System update applied', time: '1 hour ago' }
  ];

  // Manage Users dialog state
  const [manageUserOpen, setManageUserOpen] = useState(false);
  const [userType, setUserType] = useState('student');
  const [userEmail, setUserEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Class Management dialog state
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const token = localStorage.getItem('token');

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserError('');
    try {
      const res = await fetch(API_BASE + '/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setUserError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(API_BASE + '/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      // handle error silently
    }
  }, [token]);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await fetch(API_BASE + '/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      const teacherList = data.filter(u => u.role === 'teacher');
      setTeachers(teacherList);
    } catch (err) {
      // handle error silently
    }
  }, [token]);

  React.useEffect(() => {
    fetchUsers();
    fetchClasses();
    fetchTeachers();
  }, [fetchUsers, fetchClasses, fetchTeachers]);

  const handleUserSave = async () => {
    if (!userEmail) {
      setUserError('Email is required');
      return;
    }
    try {
      const res = await fetch(API_BASE + '/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: userEmail, role: userType }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add user');
      }
      setSnackbar({ open: true, message: 'User added successfully', severity: 'success' });
      setManageUserOpen(false);
      setUserEmail('');
      fetchUsers();
    } catch (err) {
      setUserError(err.message);
    }
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(API_BASE + `/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleClassAssignment = async () => {
    if (!selectedCourse || !selectedTeacher) return;
    try {
      const classObj = classes.find(c => c.name === selectedCourse);
      const teacherObj = teachers.find(t => t.email === selectedTeacher);
      if (!classObj || !teacherObj) {
        setSnackbar({ open: true, message: 'Invalid class or teacher selected', severity: 'error' });
        return;
      }
      const res = await fetch(API_BASE + `/classes/${classObj.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teacher_id: teacherObj.id, name: classObj.name }),
      });
      if (!res.ok) throw new Error('Failed to assign teacher');
      setSnackbar({ open: true, message: 'Teacher assigned to class', severity: 'success' });
      setClassDialogOpen(false);
      setSelectedCourse('');
      setSelectedTeacher('');
      fetchClasses();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{
                    bgcolor: `${stat.color}.main`,
                    mr: 2,
                    width: 56,
                    height: 56
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{ mb: 2 }}
              startIcon={<PeopleIcon />}
              onClick={() => setManageUserOpen(true)}
            >
              Manage Users
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              startIcon={<SchoolIcon />}
              onClick={() => setClassDialogOpen(true)}
            >
              Class Management
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SettingsIcon />}
            >
              System Settings
            </Button>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={activity.action}
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Manage Users Dialog */}
      <Dialog open={manageUserOpen} onClose={() => setManageUserOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Manage Users</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {userError && <Alert severity="error" sx={{ mb: 2 }}>{userError}</Alert>}
            <TextField
              select
              fullWidth
              label="User Type"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label={`${userType === 'student' ? 'Student' : 'Teacher'} Email`}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleUserSave}
              disabled={!userEmail}
              fullWidth
            >
              Save
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Existing Users
            </Typography>
            {loadingUsers ? (
              <CircularProgress />
            ) : (
              <List>
                {users.map((user) => (
                  <ListItem
                    key={user.id}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleUserDelete(user.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={user.email} secondary={user.role} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageUserOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Class Management Dialog */}
      <Dialog open={classDialogOpen} onClose={() => setClassDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Teacher to Course</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Select Course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">
                <em>-- Select Course --</em>
              </MenuItem>
              {classes.map((course) => (
                <MenuItem key={course.id} value={course.name}>
                  {course.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Assign Teacher"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <MenuItem value="">
                <em>-- Select Teacher --</em>
              </MenuItem>
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.email}>
                  {teacher.email}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClassDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClassAssignment}
            variant="contained"
            disabled={!selectedCourse || !selectedTeacher}
          >
            Save Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default AdminDashboard;
