const asyncHandler = require('../../utils/asyncHandler');
const purchaseOrderService = require('./purchaseOrder.service');

// 1. Create Purchase Order
const createPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.createPurchaseOrder(req.body);
  return res.status(201).json({
    success: true,
    message: `Purchase Order ${po.poNumber} created successfully`,
    data: po
  });
});

// 2. GET Paginated Purchase Orders List
const getAllPurchaseOrders = asyncHandler(async (req, res) => {
  const result = await purchaseOrderService.getAllPurchaseOrders(req.query);
  return res.status(200).json({
    success: true,
    data: result.purchaseOrders,
    pagination: result.pagination
  });
});

// 3. GET Purchase Order Details by ID
const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const po = await purchaseOrderService.getPurchaseOrderById(id);
  return res.status(200).json({
    success: true,
    data: po
  });
});

// 4. Update Purchase Order Headers & Items
const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const po = await purchaseOrderService.updatePurchaseOrder(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Purchase Order updated successfully',
    data: po
  });
});

// 5. Approve Purchase Order
const approvePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const po = await purchaseOrderService.approvePurchaseOrder(id);
  return res.status(200).json({
    success: true,
    message: `Purchase Order ${po.poNumber} approved successfully`,
    data: po
  });
});

// 6. Update Status Transition
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const po = await purchaseOrderService.updateStatus(id, status);
  return res.status(200).json({
    success: true,
    message: `Purchase Order status updated to '${status}' successfully`,
    data: po
  });
});

// 7. Update Payment Status
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  const po = await purchaseOrderService.updatePaymentStatus(id, paymentStatus);
  return res.status(200).json({
    success: true,
    message: `Purchase Order payment status updated to '${paymentStatus}' successfully`,
    data: po
  });
});

// 8. Receive Purchase Order Stock Items
const receiveItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const po = await purchaseOrderService.receiveItems(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Inventory items received and stock updated in warehouse successfully',
    data: po
  });
});

// 9. Upload Supplier Invoice & Auto-Create Expense
const uploadSupplierInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await purchaseOrderService.uploadSupplierInvoice(id, req.file);
  return res.status(201).json({
    success: true,
    message: result.message,
    data: result.data
  });
});

// 10. Record Payment
const createPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await purchaseOrderService.createPayment(id, req.body);
  return res.status(200).json(result);
});

// 11. Print Purchase Order HTML
const printPurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const printData = await purchaseOrderService.getPrintData(id);

  if (req.query.format === 'html' || (req.headers.accept && req.headers.accept.includes('text/html'))) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(printData.html);
  }

  return res.status(200).json({
    success: true,
    data: printData
  });
});

// 12. Generate PDF Document
const generatePdf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pdfData = await purchaseOrderService.getPdfData(id);

  if (req.query.format === 'html' || (req.headers.accept && req.headers.accept.includes('text/html'))) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(pdfData.html);
  }

  return res.status(200).json({
    success: true,
    data: pdfData
  });
});

// 13. Delete Purchase Order
const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await purchaseOrderService.deletePurchaseOrder(id);
  return res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  approvePurchaseOrder,
  updateStatus,
  updatePaymentStatus,
  receiveItems,
  uploadSupplierInvoice,
  createPayment,
  printPurchaseOrder,
  generatePdf,
  deletePurchaseOrder
};
