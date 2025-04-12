import React from 'react';
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
  Avatar
} from '@mui/material';
import {
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const TeacherDashboard = () => {
  const classes = [
    { name: 'Mathematics', time: 'Mon/Wed 9:00-10:30' },
    { name: 'Physics', time: 'Tue/Thu 11:00-12:30' },
    { name: 'Chemistry', time: 'Fri 10:00-12:00' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Teacher Dashboard
      </Typography>
      
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
            >
              Create Assignment
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mb: 2 }}
              startIcon={<PeopleIcon />}
            >
              View Students
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<ClassIcon />}
            >
              Add New Class
            </Button>
          </Paper>
        </Grid>

        {/* Upcoming Classes */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Classes
            </Typography>
            <List>
              {classes.map((cls, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ClassIcon />
                    </Avatar>
                    <ListItemText
                      primary={cls.name}
                      secondary={cls.time}
                    />
                    <Button variant="text" color="primary">
                      Details
                    </Button>
                  </ListItem>
                  {index < classes.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;
