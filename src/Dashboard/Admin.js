import React from 'react';
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
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

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
            >
              Manage Users
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mb: 2 }}
              startIcon={<SchoolIcon />}
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
    </Box>
  );
};

export default AdminDashboard;
