import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableRow } from '@mui/material';
import logo from './assets/logo.jpeg';
import sign from './assets/signimg.jpeg';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertLessThanOneThousand(num) {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + ' ' + ones[num % 10];
    return ones[Math.floor(num / 100)] + ' Hundred ' + convertLessThanOneThousand(num % 100);
  }

  if (num === 0) return 'Zero';
  let result = '';
  if (num >= 10000000) {
    result += convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    result += convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num > 0) {
    result += convertLessThanOneThousand(num);
  }
  return result.trim() + ' Rupees Only';
};

const InvoiceTemplate = ({
  invoiceNumber,
  date,
  customer,
  items,
  subtotal,
  taxDetails,
  grandTotal
}) => {
  const formattedDate = formatDate(date);

  // Table cell styling
  const tableCellStyle = {
    border: '1px solid #ccc',
    padding: '4px',
    fontSize: '8pt'
  };

  const headerCellStyle = {
    ...tableCellStyle,
    fontWeight: 'bold',
    backgroundColor: '#f2f2f2'
  };

  // Render a complete invoice copy
  const renderInvoiceCopy = (copyType) => (
    <Box sx={{ width: '100%', padding: '8px' , '@media print': {
        width: '48%', 
        float: 'left',
        marginRight: '4%'
      } }}>
      {/* Centered Header */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <img src={logo} alt="Company Logo" style={{ height: 40, marginBottom: 8 }} />
        <Typography sx={{ fontSize: '13pt', fontWeight: 'bold' }}>RIDER PAPER PRODUCTS</Typography>
        <Typography sx={{ fontSize: '8pt' }}>
          Near Kumaraswami Bettu Gulvadi, Gulvadi (Post), Kundapura (Tq), Udupi - 576283<br />
          Tel: +91 8546941772 | Email: riderpaperpdt@gmail.com<br />
          GST No: 29ABFFR9148A1Z1 | PAN No: ABFFR9148A
        </Typography>
      </Box>

      {/* Invoice Title */}
      <Typography sx={{ 
        fontSize: '12pt', 
        fontWeight: 'bold', 
        textDecoration: 'underline',
        textAlign: 'center',
        mb: 2
      }}>
        TAX INVOICE ({copyType.toUpperCase()})
      </Typography>

      {/* Invoice Details */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 2,
        fontSize: '9pt'
      }}>
        <Box>
          <Typography><strong>Invoice No:</strong> {invoiceNumber}</Typography>
          <Typography><strong>Date:</strong> {formattedDate}</Typography>
        </Box>
      </Box>

      {/* Customer Details */}
      {customer && (
        <Box sx={{ 
          border: '1px solid #ddd', 
          p: 1, 
          mb: 2,
          fontSize: '9pt'
        }}>
          <Typography sx={{ fontWeight: 'bold' }}>Customer Details:</Typography>
          <Typography>Name: {customer.cus_name}</Typography>
          <Typography>Address: {customer.cus_addr}</Typography>
          <Typography>GST: {customer.gst_num}</Typography>
          <Typography>State: {customer.state_name} ({customer.state_code})</Typography>
        </Box>
      )}

      {/* Items Table */}
      <Table size="small" sx={{ borderCollapse: 'collapse', width: '100%', mb: 1 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={headerCellStyle}>HSN</TableCell>
            <TableCell sx={headerCellStyle}>Description</TableCell>
            <TableCell sx={headerCellStyle}>UOM</TableCell>
            <TableCell sx={{ ...headerCellStyle, textAlign: 'right' }}>Qty</TableCell>
            <TableCell sx={{ ...headerCellStyle, textAlign: 'right' }}>Rate</TableCell>
            <TableCell sx={{ ...headerCellStyle, textAlign: 'right' }}>Amount</TableCell>
          </TableRow>
          {items.map((item, index) => (
            <TableRow key={`${copyType}-items-${index}`}>
              <TableCell sx={tableCellStyle}>{item.hsn_code}</TableCell>
              <TableCell sx={tableCellStyle}>{item.prod_name}</TableCell>
              <TableCell sx={tableCellStyle}>{item.uom}</TableCell>
              <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>{item.qty}</TableCell>
              <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>{item.price.toFixed(2)}</TableCell>
              <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>{(item.qty * item.price).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Totals Table */}
      <Table size="small" sx={{ width: '100%', border: '1px solid #ccc', mb: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={tableCellStyle}>Subtotal</TableCell>
            <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>₹{subtotal.toFixed(2)}</TableCell>
          </TableRow>
          {taxDetails.map((tax, idx) => (
            <React.Fragment key={`${copyType}-tax-${idx}`}>
              <TableRow>
                <TableCell sx={tableCellStyle}>CGST {tax.tax_rate / 2}%</TableCell>
                <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>₹{tax.cgst_amount.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={tableCellStyle}>SGST {tax.tax_rate / 2}%</TableCell>
                <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>₹{tax.sgst_amount.toFixed(2)}</TableCell>
              </TableRow>
            </React.Fragment>
          ))}
          <TableRow>
            <TableCell sx={{ ...tableCellStyle, fontWeight: 'bold' }}>Grand Total</TableCell>
            <TableCell sx={{ ...tableCellStyle, textAlign: 'right', fontWeight: 'bold' }}>₹{grandTotal.toFixed(2)}</TableCell>
          </TableRow>
          
        </TableBody>
      </Table>

      <Box sx={{ fontSize: '6pt',fontStyle: 'italic'}}>
        <Typography>
          <strong>Total Amount in Words:</strong> {numberToWords(Math.floor(grandTotal))}
        </Typography>
      </Box>

      {/* Bank Info */}
      <Box sx={{ 
        borderTop: '1px dashed #aaa', 
        pt: 1, 
        mb: 2,
        fontSize: '6pt'
      }}>
        <Typography sx={{ fontWeight: 'bold' }}>Bank Details:</Typography>
        <Typography>Rider Paper Products (O/D A/C)</Typography>
        <Typography>Bank of Baroda, A/c No: 81780500000662</Typography>
        <Typography>Branch: Gulvadi | IFSC: BARB0VJGULW</Typography>
      </Box>

      {/* Signature */}
      <Box sx={{ textAlign: 'right', mb: 2 }}>
        <Typography>For <strong>RIDER PAPER PRODUCTS</strong></Typography>
        <Box sx={{ mt: 2, display: 'inline-block' }}>
          <Typography>Authorized Signatory</Typography>
          <Box
            component="img"
            src={sign}
            alt="Signature"
            sx={{
              height: 40,
              mt: 1,
              objectFit: 'contain'
            }}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        fontSize: '6pt'
      }}>
        <Typography>E. & O.E</Typography>
        <Typography>www.riderpaperproducts.com</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      fontFamily: 'Arial, sans-serif',
      fontSize: '9pt',
      maxWidth: '297mm', // Slightly wider to accommodate two copies
      height: '210mm',
      margin: '0 auto',
      padding: '8px',
      backgroundColor: '#fff',
      display: 'flex', // Horizontal layout
      border: '1px solid #ccc'
    }}>
      {renderInvoiceCopy('original')}
      <Box sx={{ borderLeft: '1px dashed #aaa' , '@media print': {
          display: 'none' // Hide divider in print
        } }}></Box>
      {renderInvoiceCopy('duplicate')}
    </Box>
  );
};

export default InvoiceTemplate;