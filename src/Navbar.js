import React, { useState, useRef } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Tooltip, Toolbar, Divider, Popper, Paper, ClickAwayListener,
  Box, Collapse, Avatar, Typography, Menu, MenuItem
} from '@mui/material';
import {
  Home as HomeIcon, Info as InfoIcon, ContactMail as ContactIcon,
  Settings as SettingsIcon, Category as CategoryIcon, Layers as LayersIcon,
  ExpandLess, ExpandMore, Assessment as ReportIcon, PeopleAlt as CustomerIcon
} from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';

import { Link  ,useNavigate } from 'react-router-dom';

const drawerWidth = 240;
const collapsedWidth = 60;

const Navbar = ({ open }) => {
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [reportMenu, setReportMenu] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
 
  const navigate = useNavigate(); 

  const masterRef = useRef(null);
  const reportRef = useRef(null);

  const handleHoverEnter = (menu) => {
    if (!open) setHoveredMenu(menu);
  };

  const handleHoverLeave = () => {
    if (!open) setHoveredMenu(null);
  };

  const handleClickAway = () => setHoveredMenu(null);

  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
    handleUserMenuClose(); // Close the user menu when opening dialog
  };
  
  const handleLogoutConfirm = async () => {
    setOpenLogoutDialog(false); // Close the dialog
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/logOut`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        navigate('/', { state: { logoutSuccess: true } });
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  

  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home1' },
    { text: 'Customer', path: '/cusinfo', icon: <CustomerIcon /> },
    { text: 'Product', path: '/product', icon: <CategoryIcon /> },
    { text: 'Billing', path: '/billing', icon: <CategoryIcon /> },
    { text: 'Delivery Challan', path: '/delivery', icon: <CategoryIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          backgroundColor: '#1e1e2f',
          color: '#fff',
          transition: 'width 0.3s',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Box>
        <Toolbar />
        <Divider />
        <List>
          {navItems.map((item, index) => (
            <Tooltip title={!open ? item.text : ''} placement="right" key={index}>
              <ListItem button component={Link} to={item.path} sx={{ py: open ? 0.6 : 1.2 }}>
                <ListItemIcon sx={{ color: '#fff', minWidth: 0, mr: open ? 2 : 'auto' }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} sx={{ lineHeight: 1.2, color: '#fff' }} />}
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* User Profile */}
      <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
        <Box display="flex" alignItems="center" gap={1} onClick={handleUserMenuOpen} sx={{ cursor: 'pointer' }}>
          <Avatar sx={{ width: 32, height: 32 }}>R</Avatar>
          {open && (
            <Box>
              <Typography variant="body2" sx={{ color: '#fff' }}>RIDER PAPER PRODUCTS</Typography>
              <Typography variant="caption" sx={{ color: '#ccc' }}>riderpaperpdt@gmail.com</Typography>
            </Box>
          )}
        </Box>
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
        >
          <MenuItem onClick={() => alert("Change Password clicked")}>Change Password</MenuItem>
          <MenuItem onClick={handleLogoutClick}>Sign Out</MenuItem>
        </Menu>
      </Box>
      {/* Logout Confirmation Dialog */}
        <Dialog
          open={openLogoutDialog}
          onClose={handleLogoutCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to log out?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogoutCancel}>Cancel</Button>
            <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
              Logout
            </Button>
          </DialogActions>
        </Dialog>
    </Drawer>
  );
};

export default Navbar;
