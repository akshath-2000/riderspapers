import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Autocomplete,
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import Header from './Header';

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch customers
        const customersResponse = await fetch(`${process.env.REACT_APP_API_URL}/cus_mas`, {
          credentials: 'include'
        });
        if (!customersResponse.ok) throw new Error('Failed to fetch customers');
        const customersData = await customersResponse.json();
        setCustomers(customersData);

        // Fetch products
        const productsResponse = await fetch(`${process.env.REACT_APP_API_URL}/prod_mas`, {
          credentials: 'include'
        });
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Fetch next invoice number (simple number)
        const invNumResponse = await fetch(`${process.env.REACT_APP_API_URL}/next_invoice_number`, {
          credentials: 'include'
        });
        // if (!invNumResponse.ok) throw new Error('Failed to fetch invoice number');
        const invNumData = await invNumResponse.json();
        setInvoiceNumber(invNumData.nextNumber);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate totals with SGST and CGST (9% each)
  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.prod_price * (quantities[item.id] || 0)), 0);
  const sgstAmount = subtotal * 0.09;
  const cgstAmount = subtotal * 0.09;
  const totalAmount = subtotal + sgstAmount + cgstAmount;

  const handleAddProduct = () => {
    if (selectedProduct && quantities[selectedProduct.id] > 0) {
      setInvoiceItems([...invoiceItems, selectedProduct]);
      setSelectedProduct(null);
    }
  };

  const handleRemoveProduct = (id) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    const newQuantities = {...quantities};
    delete newQuantities[id];
    setQuantities(newQuantities);
  };

  const handleQuantityChange = (id, value) => {
    setQuantities({
      ...quantities,
      [id]: parseInt(value) || 0
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setInvoiceItems([]);
    setQuantities({});
  };

  const handleSave = async () => {
    try {
      if (!selectedCustomer) throw new Error('Please select a customer');
      if (invoiceItems.length === 0) throw new Error('Please add at least one product');

      // Prepare invoice data
      const invoiceData = {
        bill_mas: {
          cus_id: selectedCustomer.id,
          inv_num: invoiceNumber,
          resp_number: `RESP-${invoiceNumber}`,
          total_amount: totalAmount,
          sgst_amount: sgstAmount,
          cgst_amount: cgstAmount,
          subtotal: subtotal
        },
        bill_det: invoiceItems.map(item => ({
          prod_id: item.id,
          qty: quantities[item.id] || 0,
          price: item.prod_price,
          total_price: item.prod_price * (quantities[item.id] || 0)
        }))
      };

      // Save to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/save_invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save invoice');
      }

      setSuccess('Invoice saved successfully!');
      
      // Refresh invoice number
      const invNumResponse = await fetch(`${process.env.REACT_APP_API_URL}/next_invoice_number`);
      const invNumData = await invNumResponse.json();
      setInvoiceNumber(invNumData.nextNumber);
      
      // Clear the form
      handleClear();

    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <Header>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Header>
    );
  }

  if (error) {
    return (
      <Header>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="error">{error}</Typography>
        </Box>
      </Header>
    );
  }

  return (
    <Header>
      <Box sx={{ p: 3 }}>
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

        {/* Company Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>TAX INVOICE</Typography>
          <Typography variant="h6">RIDER PAPER PRODUCTS</Typography>
          <Typography variant="body2">
            Near Kumaraswami Bettu Gulvadi, Gulvadi (Post), Kundapura (Tq), Udupi - 576283
          </Typography>
          <Typography variant="body2">
            Tel. No: +91 8546941772 | E-Mail : riderpaperpdt@gmail.com
          </Typography>
          <Typography variant="body2">
            GST No: 29ABFFR9148A1Z1 | PAN No.: ABFFR9148A
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Bank Details:</strong><br />
            Account Name: Rider Paper Products<br />
            Account Type: O/D A/C<br />
            Bank Name: Bank of Baroda<br />
            Account No: 81780500000662<br />
            Branch Name: Gulvadi<br />
            IFSC Code: BARB0VJGULW
          </Typography>
        </Box>

        {/* Invoice Info */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mb: 3,
          p: 2,
          border: '1px solid #ddd',
          borderRadius: 1
        }}>
          <Box>
            <Typography><strong>Invoice No:</strong> {invoiceNumber}</Typography>
            <Typography><strong>Date:</strong> {currentDate}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography><strong>Original for Recipient</strong></Typography>
            <Typography><strong>Duplicate for Supplier</strong></Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Customer Selection */}
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.cus_name}
            value={selectedCustomer}
            onChange={(event, newValue) => setSelectedCustomer(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Customer" variant="outlined" fullWidth required />
            )}
          />
        </Box>

        {/* Customer Details */}
        {selectedCustomer && (
          <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 3 }}>
            <Typography variant="subtitle1">Customer Details:</Typography>
            <Typography><strong>Name:</strong> {selectedCustomer.cus_name}</Typography>
            <Typography><strong>Address:</strong> {selectedCustomer.cus_addr}</Typography>
            <Typography><strong>GST:</strong> {selectedCustomer.gst_num}</Typography>
            <Typography><strong>State:</strong> {selectedCustomer.state_name} ({selectedCustomer.state_code})</Typography>
          </Box>
        )}

        {/* Product Selection */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.prod_name} (${option.hsn_code})`}
                value={selectedProduct}
                onChange={(event, newValue) => setSelectedProduct(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Product" variant="outlined" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Qty"
                type="number"
                variant="outlined"
                fullWidth
                value={selectedProduct ? (quantities[selectedProduct.id] || '') : ''}
                onChange={(e) => selectedProduct && handleQuantityChange(selectedProduct.id, e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Add />}
                onClick={handleAddProduct}
                disabled={!selectedProduct || !quantities[selectedProduct.id]}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Invoice Items Table */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>HSN</TableCell>
                <TableCell>UOM</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.prod_name}</TableCell>
                  <TableCell>{item.hsn_code}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={quantities[item.id] || 0}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      size="small"
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>{item.prod_price.toFixed(2)}</TableCell>
                  <TableCell>{(item.prod_price * (quantities[item.id] || 0)).toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRemoveProduct(item.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {invoiceItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No items added</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Typography><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</Typography>
          <Typography><strong>SGST (9%):</strong> ₹{sgstAmount.toFixed(2)}</Typography>
          <Typography><strong>CGST (9%):</strong> ₹{cgstAmount.toFixed(2)}</Typography>
          <Typography variant="h6"><strong>Total:</strong> ₹{totalAmount.toFixed(2)}</Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleClear}>
            Clear
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!selectedCustomer || invoiceItems.length === 0}
          >
            Save Invoice
          </Button>
          <Button variant="contained" color="success" onClick={handlePrint}>
            Print Invoice
          </Button>
        </Box>

        {/* Signature */}
        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Typography variant="body2">For RIDER PAPER PRODUCTS</Typography>
          <Box sx={{ mt: 6 }}>
            <Typography variant="body2">Authorized Signatory</Typography>
          </Box>
        </Box>
      </Box>
    </Header>
  );
};

export default Billing;