// Header.js
import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Badge,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';

const drawerWidth = 240;
const collapsedWidth = 60;

const AppBarStyled = styled(AppBar)(({ open }) => ({
  zIndex: 1300,
  transition: 'width 0.3s',
  marginLeft: open ? drawerWidth : collapsedWidth,
  width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(1, 3, 3, 3),
    // marginLeft: open ? drawerWidth : collapsedWidth,
    transition: 'margin 0.3s',
  })
);

const Header = ({ children }) => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => setOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar
            sx={{
                minHeight: '48px !important',
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
            >
            {/* Left section: Icon + Company Name */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                color="inherit"
                edge="start"
                onClick={toggleDrawer}
                sx={{ mr: 1 }}
                >
                <MenuIcon />
                </IconButton>
                <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ color: 'white' }}
                >
                RIDER PAPER PRODUCTS
                </Typography>
            </Box>

            {/* Right section: Notifications */}
            <IconButton color="inherit" style={{ display: 'none' }}>
                <Badge badgeContent={3} color="error">
                <NotificationsIcon />
                </Badge>
            </IconButton>
            </Toolbar>

      </AppBarStyled>

      <Navbar open={open} />

      <Main open={open}>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
};

export default Header;
