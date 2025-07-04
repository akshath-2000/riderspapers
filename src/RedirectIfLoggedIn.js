import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectIfLoggedIn = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          method: 'GET',
          credentials: 'include'
        });

        if (res.ok) {
          navigate('/home');
        } else {
          setChecking(false); // Show login page
        }
      } catch (err) {
        console.log("Error checking login status:", err);
        setChecking(false);
      }
    };

    checkLoggedIn();
  }, [navigate]);

  if (checking) return null; // Or a loading spinner

  return children;
};

export default RedirectIfLoggedIn;