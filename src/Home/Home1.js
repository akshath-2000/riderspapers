import React, { useState, useEffect } from 'react';
import Header from '../Header';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import withAuth from '../withAuth';

const Home1 = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalDaySales: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/dashboard-stats`, {
            credentials: 'include'
          });
        console.log('response', response);
        if (!response.ok) throw new Error('Failed to fetch statistics');
        const data = await response.json();
        setStats({
          totalCustomers: data.totalCustomers,
          totalProducts: data.totalProducts,
          totalSales: data.totalSales,
          totalDaySales: data.totalDaySales,
          loading: false
        });
      } catch (err) {
        setStats(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <Header>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Header>
    );
  }

  if (stats.error) {
    return (
      <Header>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="error">{stats.error}</Typography>
        </Box>
      </Header>
    );
  }

  const cardStyle = {
    minHeight: 120,
    boxShadow: 2,
    transition: '0.3s',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: 6,
      transform: 'scale(1.02)'
    }
  };

  const titleStyle = {
    fontSize: '1rem',
    fontWeight: 500,
    marginBottom: '0.5rem'
  };

  const valueStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold'
  };

  return (
    <Header>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>

          <Grid item xs={12} sm={4}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography sx={titleStyle}>Total Day Sales</Typography>
                <Typography sx={valueStyle} color="success.main">
                  ₹{stats.totalDaySales}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Sales */}
          <Grid item xs={12} sm={4}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography sx={titleStyle}>Total Sales</Typography>
                <Typography sx={valueStyle} color="success.main">
                  ₹{stats.totalSales.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Customers */}
          <Grid item xs={12} sm={4}>
            <Card sx={cardStyle} onClick={() => navigate('/cusinfo')}>
              <CardContent>
                <Typography sx={titleStyle}>Total Customers</Typography>
                <Typography sx={valueStyle} color="primary">
                  {stats.totalCustomers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Products */}
          <Grid item xs={12} sm={4}>
            <Card sx={cardStyle} onClick={() => navigate('/product')}>
              <CardContent>
                <Typography sx={titleStyle}>Total Products</Typography>
                <Typography sx={valueStyle} color="secondary">
                  {stats.totalProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          
        </Grid>
      </Box>
    </Header>
  );
};

export default withAuth(Home1);
