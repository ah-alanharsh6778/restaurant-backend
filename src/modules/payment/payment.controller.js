const asyncHandler = require('../../utils/asyncHandler');
const paymentService = require('./payment.service');

const processPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.processPayment(req.body, req.user);
  return res.status(201).json({
    success: true,
    message: 'Payment processed successfully',
    data: payment
  });
});

const getAllPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getAllPayments(req.query);
  return res.status(200).json({
    success: true,
    data: result.payments,
    pagination: result.pagination
  });
});

const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await paymentService.getPaymentById(id);
  return res.status(200).json({
    success: true,
    data: payment
  });
});

const getPaymentsByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const payments = await paymentService.getPaymentsByOrderId(orderId);
  return res.status(200).json({
    success: true,
    data: payments
  });
});

module.exports = {
  processPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByOrderId
};
