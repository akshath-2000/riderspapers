// src/withAuth.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import axios from 'axios'

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-auth`, {
            method: 'GET',
            credentials: 'include', 
          });
          console.log('Auth check response:', res);

          if (res.ok) {
            alert('You are authenticated');
            setIsAuthenticated(true);
          } else {
            alert('You are not authenticated');
            navigate('/login');
          }
        } catch (error) {
          navigate('/login');
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, [navigate]);

    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress />
        </Box>
      );
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;