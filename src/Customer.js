import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  TextField,
  Dialog,DialogTitle,DialogContent,DialogActions,MenuItem,
} from '@mui/material';
import { Edit, Delete, ArrowBack , ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Autocomplete } from '@mui/material';
import Header from './Header';
import withAuth from './withAuth';

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [customerId ,setCustomerId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCustomerTypes = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/customerTypeList`, {
        credentials: 'include'
      });
      const data = await res.json();
      setCustomerTypes(data);
    } catch {
      setError('Failed to fetch customer types');
    }
  };

  const fetchCustomers = async (type = '') => {
    try {
      setLoading(true);
      const url = type
        ? `${process.env.REACT_APP_API_URL}/cusList?type=${type}`
        : `${process.env.REACT_APP_API_URL}/cusList`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      setCustomers(data);
      setError(null);
    } catch {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerTypes();
    fetchCustomers();
  }, []);

  const handleSubmit = async () => {
    if (!formCode || !formName || !formType) {
      setError('Please fill all fields');
      return;
    }
    try {
        const bodyData = {
            code: formCode,
            name: formName,
            type: formType
          };
        if (customerId) {
            bodyData.id = customerId; // Include ID for update
        }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/cusAddUpdate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create customer');
      }

      setSuccess(customerId ? 'Customer updated successfully' : 'Customer created successfully');
      setFormCode('');
      setFormName('');
      setFormType(null);
      setShowForm(false);
      await fetchCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (customer) => {
    setCustomerId(customer.id); // Store customer ID for editing
    setFormCode(customer.cus_code);
    setFormName(customer.cus_name);
    setFormType(customer.cus_type_id);
    setShowForm(true);
  };

  return (
    <Header>
      <Box>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert severity="error" onClose={handleCloseAlert}>{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert severity="success" onClose={handleCloseAlert}>{success}</Alert>
        </Snackbar>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Customers</Typography>
          {!showForm && (
            <Button variant="contained" onClick={() => setShowForm(true)}>
              Create Customer
            </Button>
          )}
        </Box>

        {showForm ? (
          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => setShowForm(false)} sx={{ mb: 2 }}>
              Back
            </Button>
            <TextField
              fullWidth
              label="Customer Name"
              variant="outlined"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              sx={{ mb: 2 }}
              size='small'
              autoComplete='off'
            />
            <TextField
              fullWidth
              label="Customer Code"
              variant="outlined"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              sx={{ mb: 2 }}
              size='small'
              autoComplete='off'
            />
            <Autocomplete
            size="small"
            options={customerTypes}
            getOptionLabel={(option) => option.cus_type}
            value={customerTypes.find((type) => type.id === formType) || null}
            onChange={(e, newValue) => setFormType(newValue ? newValue.id : null)}
            renderInput={(params) => (
                <TextField {...params} label="Customer Type" variant="outlined" />
            )}
            />

            <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
                {customerId ? 'Update Customer' : 'Save Customer'}
            </Button>
          </Box>
        ) : (
          <>
            <Box display="flex" gap={2} mb={2}>
                <Box>
              <Autocomplete
                options={[{ id: 0, cus_type: 'All' }, ...customerTypes]}
                getOptionLabel={(option) => option.cus_type}
                value={filterType}
                onChange={(e, newValue) => setFilterType(newValue)}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="Customer Type" placeholder="Customer Type" variant="standard" />
                )}
              />
              </Box>
              <Box>
              <Button
                variant="outlined"
                size='small'
                onClick={() => fetchCustomers(filterType ? filterType.id : '')}
                sx={{ height: 40, mt: 1 }}
              >
                Load
              </Button>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 ,maxHeight: 'calc(100vh - 300px)', overflowY: 'auto'}}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Customer Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Customer Type</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customers.length ? (
                      customers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((cus, i) => (
                        <TableRow key={cus.id}>
                          <TableCell align="center">{i + 1}</TableCell>
                          <TableCell>{cus.cus_code}</TableCell>
                          <TableCell>{cus.cus_name}</TableCell>
                          <TableCell>{cus.cus_type}</TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => handleEdit(cus)}><Edit /></IconButton>
                            <IconButton color="error" onClick={() => {
                                setCustomerToDelete(cus);
                                setDeleteDialogOpen(true);
                                }}>
                                <Delete />
                            </IconButton>

                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No customers found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {/* Pagination controls */}
            {customers.length > 0 && (
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Rows per page:</Typography>
                  <TextField
                    select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    sx={{ width: 80 }}
                  >
                    {[5, 10, 25, 50].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="body2">
                    {`${page * rowsPerPage + 1}-${Math.min(
                      (page + 1) * rowsPerPage,
                      customers.length
                    )} of ${customers.length}`}
                  </Typography>
                  <IconButton
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={() => setPage((prev) => 
                      Math.min(prev + 1, Math.ceil(customers.length / rowsPerPage) - 1)
                    )}
                    disabled={page >= Math.ceil(customers.length / rowsPerPage) - 1}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
            <Typography>
            Are you sure you want to delete <strong>{customerToDelete?.cus_name}</strong>?
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
            </Button>
            <Button
            onClick={async () => {
                try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/cusDelete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: customerToDelete.id }),
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Failed to delete customer');
                setSuccess('Customer deleted successfully');
                await fetchCustomers();
                } catch (err) {
                setError(err.message);
                } finally {
                setDeleteDialogOpen(false);
                setCustomerToDelete(null);
                }
            }}
            color="error"
            variant="contained"
            >
            Delete
            </Button>
        </DialogActions>
        </Dialog>



    </Header>
  );
};

export default withAuth(Customer);
