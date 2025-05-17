import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Avatar, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Fetch user info from backend
    fetch('http://localhost:8000/user')
      .then(res => res.json())
      .then(data => setUserInfo(data))
      .catch(err => {
        console.error('Error fetching user info:', err);
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/logout');
      const data = await response.json();
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/');
    }
  };

  if (!userInfo) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={userInfo.picture}
              alt={userInfo.name}
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Typography component="h1" variant="h4" gutterBottom>
              Welcome, {userInfo.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {userInfo.email}
            </Typography>
          </Box>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 