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
import Header from '../Header';
import withAuth from '../withAuth';

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

const Prodmas = () => {
  const [tabValue, setTabValue] = useState(0);
  const [productName, setProductName] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [uom, setUom] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [cgst , setCgst] = useState('');
  const [sgst , setSgst] = useState('');

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/prod_mas`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify(editId ? 
      {
        prod_id: editId,
        prod_name: productName,
        hsn_code: hsnCode,
        uom: uom,
        prod_price: prodPrice,
        cgst: cgst,
        sgst: sgst
      } : {
        prod_name: productName,
        hsn_code: hsnCode,
        uom: uom,
        prod_price: prodPrice,
        cgst: cgst,
        sgst: sgst
      });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/add_prod`, {
        method: 'POST',
        headers,
        body,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Request failed');
      }
      
      setSuccess(`Product ${editId ? 'updated' : 'added'} successfully`);
      await fetchProducts();
      
      // Reset form
      setProductName('');
      setHsnCode('');
      setUom('');
      setProdPrice('');
      setCgst('');
      setSgst('');
      setEditId(null);

      // Switch to list tab
      setTabValue(1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    const product = products.find(p => p.id === id);
    setProductName(product.prod_name || '');
    setHsnCode(product.hsn_code || '');
    setUom(product.uom || '');
    setProdPrice(product.prod_price || '');
    setCgst(product.cgst || '');
    setSgst(product.sgst || '');
    setEditId(id);
    setTabValue(0);
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/prodDlt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prod_id: productToDelete }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete product');
      }

      setSuccess('Product deleted successfully');
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
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
              Are you sure you want to delete this product? This action cannot be undone.
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
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="product tabs">
            <Tab label="Create Product" {...a11yProps(0)} />
            <Tab label="Product List" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
            <TextField
              label="Product Name"
              variant="outlined"
              size='small'
              fullWidth
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="HSN Code"
              variant="outlined"
              size='small'
              fullWidth
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="UOM (Unit of Measure)"
              variant="outlined"
              size='small'
              fullWidth
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="Product Price"
              variant="outlined"
              size='small'
              fullWidth
              type="number"
              value={prodPrice}
              onChange={(e) => setProdPrice(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="CGST"
              variant="outlined"
              size='small'
              fullWidth
              type="number"
              value={cgst}
              onChange={(e) => setCgst(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="SGST"
              variant="outlined"
              size='small'
              fullWidth
              type="number"
              value={sgst}
              onChange={(e) => setSgst(e.target.value)}
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
                  setProductName('');
                  setHsnCode('');
                  setUom('');
                  setProdPrice('');
                  setCgst('');
                  setSgst('');
                }}
                sx={{ ml: 2 }}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1} sx={{ overflowX: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table size="small" sx={{ minWidth: 650 }} aria-label="product table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>HSN Code</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>UOM</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>CGST</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>SGST</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((row, index) => (
                      <TableRow 
                        key={row.id} 
                        sx={{
                          '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' },
                          '&:hover': { backgroundColor: '#f1f1f1' },
                        }}
                      >
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell>{row.prod_name}</TableCell>
                        <TableCell>{row.hsn_code}</TableCell>
                        <TableCell>{row.uom}</TableCell>
                        <TableCell>{row.prod_price}</TableCell>
                        <TableCell>{row.cgst}</TableCell>
                        <TableCell>{row.sgst}</TableCell>
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
                      <TableCell colSpan={6} align="center">
                        No products found
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

export default withAuth(Prodmas);