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
  Alert,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Add, Delete, Save, Edit, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import Header from './Header';
import html2pdf from 'html2pdf.js';
import InvoiceTemplate from './DeliveryTemplate';
import ReactDOM from 'react-dom';
import logo from './assets/logo.jpeg';
import withAuth from './withAuth';


const Delivery = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [openGroups, setOpenGroups] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [isEditingInvoiceNumber, setIsEditingInvoiceNumber] = useState(false);
  const [tempInvoiceNumber, setTempInvoiceNumber] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const [invoiceDate, setInvoiceDate] = useState(formatDate(new Date()));


  useEffect(() => {
  const loadInvoice = async () => {
    const invoiceId = window.location.pathname.split('/').pop();
    
    if (invoiceId && !isNaN(invoiceId)) {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/get_invoice?id=${invoiceId}`);
        if (!response.ok) throw new Error('Failed to load invoice');
        
        const data = await response.json();
        
        setEditingInvoiceId(data.bill_mas.id);
        setInvoiceNumber(data.bill_mas.inv_num);
        setInvoiceDate(formatDate(data.bill_mas.inv_date) || formatDate(new Date()));
        setIsEditing(true);
        
        // Set customer
        const customer = customers.find(c => c.id === data.bill_mas.cus_id);
        if (customer) setSelectedCustomer(customer);
        
        // Set products and quantities
        const items = [];
        const newQuantities = {};
        const newPrices = {};
        
        data.bill_det.forEach(item => {
          const product = products.find(p => p.id === item.prod_id);
          if (product) {
            items.push(product);
            newQuantities[item.prod_id] = item.qty;
            newPrices[item.prod_id] = item.price;
          }
        });
        
        setInvoiceItems(items);
        setQuantities(newQuantities);
        setPrices(newPrices);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (customers.length > 0 && products.length > 0) {
    loadInvoice();
  }
}, [customers, products]);

  // Calculate tax percentage from CGST and SGST
  const calculateTaxPercentage = (product) => {
    if (!product) return 0;
    const cgst = parseFloat(product.cgst) || 0;
    const sgst = parseFloat(product.sgst) || 0;
    return cgst + sgst;
  };

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

        // Fetch next invoice number
        const invNumResponse = await fetch(`${process.env.REACT_APP_API_URL}/next_invoice_number`, {
          credentials: 'include'
        });
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

  // Group items by tax percentage
  const groupItemsByTax = () => {
    const groups = {};
    
    invoiceItems.forEach(item => {
      const taxRate = calculateTaxPercentage(item);
      if (!groups[taxRate]) {
        groups[taxRate] = {
          items: [],
          subtotal: 0
        };
      }
      
      const quantity = quantities[item.id] || 0;
      const price = prices[item.id] !== undefined ? prices[item.id] : item.prod_price;
      const itemTotal = price * quantity;
      
      groups[taxRate].items.push({
        ...item,
        quantity,
        price,
        itemTotal
      });
      groups[taxRate].subtotal += itemTotal;
    });
    
    return groups;
  };

  // Calculate totals for each tax group
  const calculateTaxGroups = () => {
    const taxGroups = groupItemsByTax();
    const result = [];
    
    Object.keys(taxGroups).forEach(taxRate => {
      const rate = parseFloat(taxRate);
      const group = taxGroups[taxRate];
      const taxAmount = group.subtotal * (rate / 100);
      
      result.push({
        taxRate: rate,
        items: group.items,
        subtotal: group.subtotal,
        taxAmount,
        total: group.subtotal + taxAmount,
        cgstAmount: taxAmount / 2,
        sgstAmount: taxAmount / 2
      });
    });
    
    return result;
  };

  // Calculate grand totals
  const taxGroups = calculateTaxGroups();
  const grandSubtotal = taxGroups.reduce((sum, group) => sum + group.subtotal, 0);
  const grandTax = taxGroups.reduce((sum, group) => sum + group.taxAmount, 0);
  const grandTotal = grandSubtotal + grandTax;

  const handleAddProduct = () => {
    if (selectedProduct && quantities[selectedProduct.id] > 0) {
      setInvoiceItems([...invoiceItems, selectedProduct]);
      if (prices[selectedProduct.id] === undefined) {
        setPrices({
          ...prices,
          [selectedProduct.id]: selectedProduct.prod_price
        });
      }
      setSelectedProduct(null);
    }
  };

  const handleRemoveProduct = (id) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    const newQuantities = {...quantities};
    delete newQuantities[id];
    setQuantities(newQuantities);
    const newPrices = {...prices};
    delete newPrices[id];
    setPrices(newPrices);
    setDeleteConfirmOpen(false);
  };

  const handleQuantityChange = (id, value) => {
    setQuantities({
      ...quantities,
      [id]: parseInt(value) || 0
    });
  };

  const handlePriceChange = (id, value) => {
    setPrices({
      ...prices,
      [id]: parseFloat(value) || 0
    });
  };

const handlePrint = () => {
  const invoiceData = {
    invoiceNumber,
    date: currentDate,
    customer: selectedCustomer,
    items: invoiceItems.map(item => ({
      ...item,
      qty: quantities[item.id] || 0,
      price: prices[item.id] !== undefined ? prices[item.id] : item.prod_price
    })),
    subtotal: grandSubtotal,
    taxDetails: taxGroups.map(group => ({
      tax_rate: group.taxRate,
      cgst_amount: group.cgstAmount,
      sgst_amount: group.sgstAmount
    })),
    grandTotal
  };

  const tempDiv = document.createElement('div');
  document.body.appendChild(tempDiv);
  ReactDOM.render(<InvoiceTemplate {...invoiceData} />, tempDiv);

  const options = {
    margin: 10,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      letterRendering: true,
      useCORS: true,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape'
    }
  };

  // Generate PDF and show in new tab
  html2pdf()
    .set(options)
    .from(tempDiv)
    .outputPdf('blob') // Get the Blob instead of saving directly
    .then((pdfBlob) => {
      const pdfURL = URL.createObjectURL(pdfBlob);
      window.open(pdfURL); // Open PDF in new tab
      document.body.removeChild(tempDiv);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF');
      document.body.removeChild(tempDiv);
    });
};


  const handleClear = () => {
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setInvoiceItems([]);
    setQuantities({});
    setPrices({});
    setOpenGroups({});
  };

  const handleSave = async () => {
  try {
    if (!selectedCustomer) throw new Error('Please select a customer');
    if (invoiceItems.length === 0) throw new Error('Please add at least one product');

    // When preparing data for saving
    const invoiceData = {
      bill_mas: {
        id: editingInvoiceId || null,
        cus_id: selectedCustomer.id,
        inv_num: invoiceNumber,
        inv_date: invoiceDate,
        total_amount: grandTotal,
        subtotal: grandSubtotal,
        tax_details: taxGroups.map(group => ({
          tax_rate: group.taxRate,
          tax_amount: group.taxAmount,
          cgst_amount: group.cgstAmount,
          sgst_amount: group.sgstAmount,
          taxable_amount: group.subtotal,
          
        }))
      },
      bill_det: invoiceItems.map(item => ({
        prod_id: item.id,
        qty: quantities[item.id] || 0,
        price: prices[item.id] !== undefined ? prices[item.id] : item.prod_price,
        total_price: (prices[item.id] !== undefined ? prices[item.id] : item.prod_price) * (quantities[item.id] || 0),
        tax_percentage: calculateTaxPercentage(item)
      }))
    };

    const endpoint = isEditing 
      ? `${process.env.REACT_APP_API_URL}/update_invoice` 
      : `${process.env.REACT_APP_API_URL}/save_invoice`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to save invoice');

    const result = await response.json();
    setSuccess(isEditing ? 'Invoice updated successfully!' : 'Invoice saved successfully!');
    
    // Redirect to edit mode with new invoice
    window.location.href = `/billing/${result.bill_mas.id}`;
    
  } catch (err) {
    setError(err.message);
  }
};

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  const toggleGroup = (taxRate) => {
    setOpenGroups(prev => ({
      ...prev,
      [taxRate]: !prev[taxRate]
    }));
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
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

  function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
  };

  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 100);

  let result = numToWords(whole) + ' Rupees';
  if (decimal) result += ' and ' + numToWords(decimal) + ' Paise';
  return result + ' Only';
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <img 
              src={logo} 
              alt="Company Logo" 
              style={{ height: '60px' }}
            />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>DELIVERY CHALLAN</Typography>
          </Box>
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
    {isEditingInvoiceNumber ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          value={tempInvoiceNumber}
          onChange={(e) => setTempInvoiceNumber(e.target.value)}
        />
        <Button 
          size="small" 
          onClick={() => {
            setInvoiceNumber(tempInvoiceNumber);
            setIsEditingInvoiceNumber(false);
          }}
        >
          Update
        </Button>
        <Button 
          size="small" 
          onClick={() => setIsEditingInvoiceNumber(false)}
        >
          Cancel
        </Button>
      </Box>
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography><strong>Delivery Charge No:</strong></Typography>
  <TextField
    size="small"
    value={invoiceNumber}
    onChange={(e) => setInvoiceNumber(e.target.value)}
    sx={{ 
      width: '150px',
      '& .MuiInputBase-input': {
        fontSize: '0.875rem',
        padding: '6px 8px'
      }
    }}
  />
  {isEditing && (
    <IconButton size="small">
      <Edit fontSize="small" />
    </IconButton>
  )}
</Box>
    )}
    <Typography style={{ display:"flex" , alignItems:"center" }} >
      <strong>Date:</strong> 
      <TextField
        type="date"
        value={invoiceDate}
        onChange={(e) => setInvoiceDate(e.target.value)}
        size="small"
        sx={{ ml: 1, width: 150 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </Typography>
  </Box>
  <Box sx={{ textAlign: 'right' }}>
    {/* <Typography><strong>Original for Recipient</strong></Typography>
    <Typography><strong>Duplicate for Supplier</strong></Typography> */}
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

        {/* Product Selection - Full Width */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} style={{ display:"grid" }} >
            <Grid item xs={8}>
              <Autocomplete
                options={products}
                 getOptionLabel={(option) => option.prod_name}
                value={selectedProduct}
                onChange={(event, newValue) => setSelectedProduct(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Product" variant="outlined" />
                )}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Qty"
                type="number"
                variant="outlined"
                
                value={selectedProduct ? (quantities[selectedProduct.id] || '') : ''}
                onChange={(e) => selectedProduct && handleQuantityChange(selectedProduct.id, e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                color="primary"
                
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
        <TableContainer
  component={Paper}
  sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}
>
  <Table
    size="small"
    sx={{
      '& thead th': {
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold',
        borderBottom: '2px solid #ddd',
      },
      '& tbody td': {
        borderBottom: '1px solid #eee',
      },
      '& tbody tr:hover': {
        backgroundColor: '#f9f9f9',
      },
      '& td, & th': {
        padding: '10px',
      },
    }}
  >
    <TableHead>
      <TableRow>
        <TableCell width="20%">Tax Rate</TableCell>
        <TableCell width="25%">Product</TableCell>
        <TableCell width="10%">HSN</TableCell>
        <TableCell width="10%">UOM</TableCell>
        <TableCell width="10%" align="right">Qty</TableCell>
        <TableCell width="10%" align="right">Price</TableCell>
        <TableCell width="15%" align="right">Amount</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {taxGroups.map((group, groupIndex) => (
        <React.Fragment key={group.taxRate}>
          {/* Group Header Row */}
          <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
            <TableCell colSpan={7}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="small"
                  onClick={() => toggleGroup(group.taxRate)}
                >
                  {openGroups[group.taxRate] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
                <Typography variant="subtitle2" sx={{ ml: 1 }}>
                  {group.taxRate}% (CGST:{(group.taxRate / 2).toFixed(2)}% + SGST:{(group.taxRate / 2).toFixed(2)}%)
                </Typography>
              </Box>
            </TableCell>
          </TableRow>

          {/* Collapsible Item Rows */}
          <TableRow>
            <TableCell colSpan={7} sx={{ padding: 0, borderBottom: '1px solid #ccc' }}>
              <Collapse in={openGroups[group.taxRate]} timeout="auto" unmountOnExit>
                <Table size="small">
                  <TableBody>
                    {group.items.map((item, itemIndex) => (
                      <TableRow key={item.id}>
                        <TableCell width="20%"></TableCell>
                        <TableCell width="25%">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {item.prod_name}
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(item)}
                              color="error"
                              sx={{ ml: 'auto' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell width="10%">{item.hsn_code}</TableCell>
                        <TableCell width="10%">{item.uom}</TableCell>
                        <TableCell width="10%" align="right">
                          <TextField
                            type="number"
                            value={quantities[item.id] || 0}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            size="small"
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell width="10%" align="right">
                          <TextField
                            type="number"
                            value={prices[item.id] !== undefined ? prices[item.id] : item.prod_price}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            size="small"
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell width="15%" align="right">
                          {((prices[item.id] !== undefined ? prices[item.id] : item.prod_price) * (quantities[item.id] || 0)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Collapse>
            </TableCell>
          </TableRow>

          {/* Subtotal */}
          <TableRow>
            <TableCell colSpan={6} align="right"><strong>Subtotal</strong></TableCell>
            <TableCell align="right">{group.subtotal.toFixed(2)}</TableCell>
          </TableRow>

          {/* CGST */}
          <TableRow>
            <TableCell colSpan={6} align="right">
              CGST ({(group.taxRate / 2).toFixed(2)}%)
            </TableCell>
            <TableCell align="right">{group.cgstAmount.toFixed(2)}</TableCell>
          </TableRow>

          {/* SGST */}
          <TableRow>
            <TableCell colSpan={6} align="right">
              SGST ({(group.taxRate / 2).toFixed(2)}%)
            </TableCell>
            <TableCell align="right">{group.sgstAmount.toFixed(2)}</TableCell>
          </TableRow>

          {/* Group Total */}
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell colSpan={6} align="right"><strong>Total ({group.taxRate}%)</strong></TableCell>
            <TableCell align="right"><strong>{group.total.toFixed(2)}</strong></TableCell>
          </TableRow>
        </React.Fragment>
      ))}

      {taxGroups.length === 0 && (
        <TableRow>
          <TableCell colSpan={7} align="center">No items added</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>


        {/* Grand Totals */}
        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Typography><strong>Grand Subtotal:</strong> ₹{grandSubtotal.toFixed(2)}</Typography>
          <Typography><strong>Total CGST:</strong> ₹{(grandTax/2).toFixed(2)}</Typography>
          <Typography><strong>Total SGST:</strong> ₹{(grandTax/2).toFixed(2)}</Typography>
          <Typography><strong>Total Tax:</strong> ₹{grandTax.toFixed(2)}</Typography>
          <Typography><strong>Rounded Grand Total:</strong> ₹{Math.round(grandTotal)}</Typography>
          <Typography variant="h6"><strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}</Typography>
          <Typography sx={{ mt: 1 }}><em>Total Amount in Words: {numberToWords(grandTotal)}</em></Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleClear}>
            Clear
          </Button>
          <Button 
            variant="contained" 
            color={editingInvoiceId ? "secondary" : "primary"} 
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!selectedCustomer || invoiceItems.length === 0}
            sx={{ display: 'none' }}
          >
            {editingInvoiceId ? 'Update Invoice' : 'Generate Invoice'}
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handlePrint}
            sx={{ ml: 2 }}
          >
            Print
          </Button>
        </Box>

        

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete {productToDelete?.prod_name} from the invoice?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={() => handleRemoveProduct(productToDelete.id)} 
              color="error" 
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Header>
  );
};

export default withAuth(Delivery);