import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          method: 'GET',
          credentials: 'include'
        });
    
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          console.error('Auth failed with status:', response.status);
          navigate('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return null; // Or a simple loading message
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;