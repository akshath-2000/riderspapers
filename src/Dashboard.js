import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper ,Typography } from '@mui/material';
import Header from './Header';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const Dashboard = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Unauthorized or expired');

        const data = await res.json();
        console.log('User data:', data);
        setUser(data.user);
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    fetchUser();
  }, []);
  return (
    <Header>
      <Container maxWidth={false}>
        {/* <Typography variant="h5" gutterBottom color="primary">
          Dashboard Overview
        </Typography> */}
         {user && (
          <Typography variant="h5" gutterBottom color="primary">
            Welcome, {user.name}!
          </Typography>
        )}

      <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={8}>
          <Item>size=8</Item>
        </Grid>
        <Grid size={4}>
          <Item>size=4</Item>
        </Grid>
        <Grid size={4}>
          <Item>size=4</Item>
        </Grid>
        <Grid size={8}>
          <Item>size=8</Item>
        </Grid>
      </Grid>
    </Box>
          
      </Container>
      </Header>
    
  );
};

export default Dashboard;
