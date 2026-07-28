const asyncHandler = require('../../utils/asyncHandler');
const orderService = require('./order.service');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user);
  return res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  return res.status(200).json({
    success: true,
    data: result.orders,
    pagination: result.pagination
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);
  return res.status(200).json({
    success: true,
    data: order
  });
});

const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.updateOrder(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: order
  });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await orderService.deleteOrder(id);
  return res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

const addOrderItem = asyncHandler(async (req, res) => {
  const orderItem = await orderService.addOrderItem(req.body);
  return res.status(201).json({
    success: true,
    message: 'Item added to order successfully',
    data: orderItem
  });
});

const removeOrderItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await orderService.removeOrderItem(id);
  return res.status(200).json({
    success: true,
    message: 'Item removed from order successfully'
  });
});

const getInvoicePdf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoiceData = await orderService.getInvoicePdfData(id);

  if (req.query.format === 'html' || (req.headers.accept && req.headers.accept.includes('text/html'))) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(invoiceData.html);
  }

  return res.status(200).json({
    success: true,
    data: invoiceData
  });
});

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  addOrderItem,
  removeOrderItem,
  getInvoicePdf
};
