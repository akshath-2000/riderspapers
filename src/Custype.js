// CustomerTypePage.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Header from './Header';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Custype = () => {
  const [tabValue, setTabValue] = useState(0);
  const [customerType, setCustomerType] = useState('');
  const [customerTypes, setCustomerTypes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Helper function to handle API errors
  const handleApiError = async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request failed');
    }
    return response.json();
  };

  // Fetch customer types from API
  const fetchCustomerTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/customerTypeList`, {
        credentials: 'include' // Needed for cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch customer types');
      }
      
      const data = await response.json();
      setCustomerTypes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load customer types on component mount
  useEffect(() => {
    fetchCustomerTypes();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const headers = {
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify(editId ? { id: editId, name: customerType } : { name: customerType });
      
      response = await fetch(`${process.env.REACT_APP_API_URL}/customerType`, {
        method: 'POST',
        headers,
        body,
        credentials: 'include',
      });
      

      await handleApiError(response);
      setSuccess(`Customer type ${editId ? 'updated' : 'added'} successfully`);
      
      // Refresh the list
      await fetchCustomerTypes();
      // Reset form
      setCustomerType('');
      setEditId(null);
      // Switch to list tab
      setTabValue(1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    const customerTypeToEdit = customerTypes.find(ct => ct.id === id);
    setCustomerType(customerTypeToEdit.cus_type);
    setEditId(id);
    setTabValue(0); // Switch to create tab
  };

  const handleDeleteClick = (id) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/customerTypeDlt`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: customerToDelete }),
        credentials: 'include',
      });
  
      await handleApiError(response);
      setSuccess('Customer type deleted successfully');
      await fetchCustomerTypes();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };
  

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Header>
    <Box sx={{ width: '100%' }}>
      {/* Success/Error notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this customer type? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer type tabs">
          <Tab label="Create Customer Type" {...a11yProps(0)} />
          <Tab label="Customer Type List" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
          <TextField
            label="Customer Type"
            variant="outlined"
            size='small'
            fullWidth
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {editId ? 'Update' : 'Add'}
          </Button>
          {editId && (
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => {
                setEditId(null);
                setCustomerType('');
              }}
              sx={{ ml: 2 }}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1} sx={{ overflowX: 'auto' , width: '50%'}}>
        {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            </Box>
        ) : (
            <TableContainer 
            component={Paper} 
            sx={{ boxShadow: 3, borderRadius: 2, overflowX: 'auto' }}
            >
            <Table size="small" sx={{ minWidth: 650 }} aria-label="customer type table">
                <TableHead>
                <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>Customer Type</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Actions</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {customerTypes.length > 0 ? (
                    customerTypes.map((row, index) => (
                    <TableRow 
                        key={row.id} 
                        sx={{
                        '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' },
                        '&:hover': { backgroundColor: '#f1f1f1' },
                        }}
                    >
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell>{row.cus_type}</TableCell>
                        <TableCell align="center">
                        <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(row.id)}
                            disabled={loading}
                        >
                            <Edit />
                        </IconButton>
                        <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(row.id)}
                            disabled={loading}
                        >
                            <Delete />
                        </IconButton>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={3} align="center">
                        No customer types found
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </TableContainer>
        )}
        </TabPanel>

    </Box>
    </Header>
  );
};

export default Custype;