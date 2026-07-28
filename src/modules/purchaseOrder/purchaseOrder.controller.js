const asyncHandler = require('../../utils/asyncHandler');
const purchaseOrderService = require('./purchaseOrder.service');

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.createPurchaseOrder(req.body);
  return res.status(201).json({
    success: true,
    message: 'Purchase order created successfully',
    data: po
  });
});

const getAllPurchaseOrders = asyncHandler(async (req, res) => {
  const result = await purchaseOrderService.getAllPurchaseOrders(req.query);
  return res.status(200).json({
    success: true,
    data: result.purchaseOrders,
    pagination: result.pagination
  });
});

const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const po = await purchaseOrderService.getPurchaseOrderById(id);
  return res.status(200).json({
    success: true,
    data: po
  });
});

const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const po = await purchaseOrderService.updatePurchaseOrderStatus(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Purchase order status updated successfully',
    data: po
  });
});

const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await purchaseOrderService.deletePurchaseOrder(id);
  return res.status(200).json({
    success: true,
    message: 'Purchase order deleted successfully'
  });
});

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
  deletePurchaseOrder
};
