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
  Avatar,
  Chip
} from '@mui/material';
import {
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const StudentDashboard = () => {
  const assignments = [
    { subject: 'Mathematics', title: 'Algebra Homework', due: 'Due Tomorrow' },
    { subject: 'Physics', title: 'Lab Report', due: 'Due in 3 days' },
    { subject: 'Chemistry', title: 'Chapter 5 Quiz', due: 'Due next week' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Student Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Upcoming Assignments */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Assignments
            </Typography>
            <List>
              {assignments.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <AssignmentIcon />
                    </Avatar>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {item.subject}
                          </Typography>
                          <br />
                          {item.due}
                        </>
                      }
                    />
                    <Chip label="Pending" color="warning" />
                  </ListItem>
                  {index < assignments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ mb: 2 }}
              startIcon={<BookIcon />}
            >
              View Grades
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mb: 2 }}
              startIcon={<ScheduleIcon />}
            >
              Class Schedule
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<AssignmentIcon />}
            >
              Submit Assignment
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
