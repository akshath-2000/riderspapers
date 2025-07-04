import React, { useState , useEffect } from 'react';
import {  
  Container, TextField, Button, Typography, Box, Paper, Link, Backdrop
} from '@mui/material';
// import backgroundImage from './assets/images/login-img.jpg';
import backgroundImage from './assets/logo.jpeg';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';


const Login = () => {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const [errorCnfPass, setErrorCnfPass] = useState(false);
  const [helperTextCnfPass, setHelperTextCnfPass] = useState('');


  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  const navigate = useNavigate(); 

  useEffect(() => {
    // Check if we came here after logout
    const locationState = window.history.state;
    if (locationState?.usr?.logoutSuccess) {
      setShowLogoutAlert(true);
      // Clear the state so the alert doesn't show again on refresh
      window.history.replaceState({}, '');
    }
  }, []);

  // useEffect(()=>{
  //   const checkLoggedIn = async () =>{
  //     try{
  //       const res = await fetch(`${process.env.REACT_APP_API_URL}/me`,{
  //         method : 'GET',
  //         credentials : 'include'
  //       });
  //       if(res.ok){
  //         navigate('/home');
  //       }
  //     }catch (err){
  //       console.log("not logged in",err);
  //     }
  //   };
  //   checkLoggedIn();
  // }, [navigate])

  const validateMobile = () => {
    const isValid = /^[0-9]{10}$/.test(mobile);
    if (!isValid) {
      setError(true);
      setHelperText('Enter a valid 10-digit mobile number');
    } else {
      setError(false);
      setHelperText('');
    }
  };

  const validateCnfPass = () => {  
    if (signupPassword !== confirmPassword) {
      setErrorCnfPass(true);
      setHelperTextCnfPass('Password is not same');
    } else {
      setErrorCnfPass(false);
      setHelperTextCnfPass('');
    }
  };

  

  


  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    if(email !== 'abcd@gmail.com'){
      alert("email is wrong");
      return;
    }
    if(password !== "welcome123"){
      alert("password is wrong");
    }

    try{
      const response = await fetch(`${process.env.REACT_APP_API_URL}/logIn`,{
        method: 'POST',
        // withCredentials: true,
        credentials: 'include',
        headers:{
          'content-type' : 'application/json'
        },
        body:JSON.stringify({email,password})
      });
      const data = await response.json();
      if(!response.ok) {
        alert(data.message || "Login failed");
        return;
      } 
      console.log('JWT TOKEN here comming',data);
      alert("login successfully")
      navigate('/home1');
    }catch (error){
      alert("error:",error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    const payload = {firstName, lastName, signupEmail, mobile, address, signupPassword};
    try{
      console.log('url',process.env.REACT_APP_API_URL);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/addUser`,{
        method: 'post',
        headers: {
          'content-type' : 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if(!response.ok) throw new Error('Failed to sign up');
      const result = await response.json();
      console.log("response",result);
      alert(result.message);
    }catch(error){
      console.error('Signup Error:', error);
      alert('something went wrong');
    }
    
  };

  return (
    <Box
    sx={{
      minHeight: '100vh',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    //   position: 'relative',  // Align children to right
        padding: 2,
    }}
  >

        {/* Snackbar for logout success message */}
        <Snackbar
      open={showLogoutAlert}
      autoHideDuration={6000}
      onClose={() => setShowLogoutAlert(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={() => setShowLogoutAlert(false)} 
        severity="success" 
        sx={{ width: '100%' }}
      >
        Logged out successfully!
      </Alert>
    </Snackbar>


    <Container maxWidth="sm" sx={{ 
        position: 'absolute',
        top: 0,
        right: 0,
        p: 2, 
        zIndex: 1000 // to ensure it stays above other content
    }}>
      <Paper elevation={3}  sx={{
            padding: 4,
            background: 'rgba(255, 255, 255, 0.7)', // More opaque white (0.7 opacity)
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)', // Safari support
            border: '1px solid rgba(255, 255, 255, 0.5)', // More visible white border
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px', // Rounded corners enhance glass effect
            transition: 'all 0.3s ease',
            // Conditional styles if needed
            ...(forgotPasswordOpen && {
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            }),
        }}>
        <Typography variant="h5" gutterBottom align="center">
          {isLogin ? 'Login' : 'Sign Up'}
        </Typography>
        
        {isLogin ? (
          <Box component="form" onSubmit={handleLogin} autoComplete="off" sx={{ overflow: 'auto'}}>        
            <TextField
                variant='standard'
              fullWidth
              id='email'
              label="Email"
              margin="normal"
              type="email"
              size='small'
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
            variant='standard'
              fullWidth
              label="Password"
              margin="normal"
              type="password"
              size='small'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ marginTop: 2, marginBottom: 2 }}
            >
              Login
            </Button>
            <Box sx={{ display: 'none', justifyContent: 'space-between' }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => setIsLogin(false)}
              >
                Don't have an account? Sign up
              </Link>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot your password?
              </Link>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSignup} autoComplete="off" sx={{ overflow: 'auto'}}>
            <Box sx={{ display: 'flex', gap: 2 ,  overflow: 'auto'}}>
              <TextField
              variant='standard'
                fullWidth
                label="First Name"
                margin="normal"
                size='small'
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
              variant='standard'
                fullWidth
                label="Last Name"
                margin="normal"
                size='small'
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Box>
            
            <TextField
            variant='standard'
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              size='small'
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            
            <TextField
            variant='standard'
              fullWidth
              label="Mobile Number"
              margin="normal"
              type="tel"
              size='small'
              required
              value={mobile}
              onChange={(e) =>{
                const value = e.target.value.replace(/\D/g, '');
                setMobile(value)
              }}
              onBlur={validateMobile}
              error={error}
              helperText={helperText}
            />
            
            <TextField
            variant='standard'
              fullWidth
              label="Address"
              margin="normal"
              size='small'
              multiline
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            
            <TextField
            variant='standard'
              fullWidth
              label="Password"
              margin="normal"
              type="password"
              size='small'
              required
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
            
            <TextField
            variant='standard'
              fullWidth
              label="Confirm Password"
              margin="normal"
              type="password"
              size='small'
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur= {validateCnfPass}
              error={errorCnfPass}
              helperText={helperTextCnfPass}
            />
            
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ marginTop: 2, marginBottom: 2 }}
            >
              Sign Up
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => setIsLogin(true)}
              >
                Already have an account? Login
              </Link>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Forgot Password Modal with Backdrop */}
      <Backdrop
  open={forgotPasswordOpen}
  sx={{
    zIndex: (theme) => theme.zIndex.modal - 1, // Adjust z-index if needed
    backgroundColor: 'rgba(0,0,0,0.5)', // Custom backdrop color
  }}
>
  <Box 
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      outline: 'none', 
      
    }}
    onClick={() => setForgotPasswordOpen(false)}
  >
    <Paper 
      elevation={3} 
      sx={{ 
        padding: 3,
        width: '90%',
        maxWidth: '400px',
        margin: 2, // Adds space around the modal
        background: 'rgba(255, 255, 255, 0.7)', // More opaque white (0.7 opacity)
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', // Safari support
        border: '1px solid rgba(255, 255, 255, 0.5)', // More visible white border
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px', 
      }}
      onClick={(e) => e.stopPropagation()} // Prevent click-through
    >
      <Typography variant="h6" gutterBottom>
        Reset Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your email to receive a password reset link
      </Typography>
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        type="email"
        size="small"
        inputRef={(input) => {
            if (input && forgotPasswordOpen) {
              setTimeout(() => input.focus(), 100);
            }
        }}
        required
        value={forgotPasswordEmail}
        onChange={(e) => setForgotPasswordEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          sx={{ mr: 1 }} 
          onClick={() => setForgotPasswordOpen(false)}
        >
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={() => {
            console.log('Password reset requested for:', forgotPasswordEmail);
            setForgotPasswordOpen(false);
          }}
        >
          Submit
        </Button>
      </Box>
    </Paper>
  </Box>
</Backdrop>
    </Container>
    </Box>
  );
};

export default Login;