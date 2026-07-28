const paymentRepository = require('./payment.repository');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const generateTransactionId = () => {
  return 'TXN-' + Date.now() + '-' + Math.floor(10000 + Math.random() * 90000);
};

const processPayment = async (data, user) => {
  const { orderId, paymentMethod, amountPaid } = data;

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) throw new NotFoundError('Order not found');

  const parsedAmountPaid = parseFloat(amountPaid);
  if (parsedAmountPaid <= 0) throw new BadRequestError('Amount paid must be greater than 0');

  const requiredAmount = order.finalAmount || order.totalAmount;
  if (parsedAmountPaid < requiredAmount) {
    throw new BadRequestError(`Amount paid (${parsedAmountPaid}) is less than required order total (${requiredAmount})`);
  }

  const changeGiven = parseFloat((parsedAmountPaid - requiredAmount).toFixed(2));
  const transactionId = data.transactionId || generateTransactionId();

  const payment = await paymentRepository.processPaymentAndUpdateOrder(orderId, {
    processedById: user ? user.id : null,
    paymentMethod,
    paymentStatus: 'PAID',
    amountPaid: parsedAmountPaid,
    changeGiven,
    transactionId
  });

  return payment;
};

const getAllPayments = async (query = {}) => {
  const { page = 1, limit = 50, paymentMethod, paymentStatus } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await paymentRepository.findAll({ skip, take, paymentMethod, paymentStatus });

  return {
    payments: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getPaymentById = async (id) => {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw new NotFoundError('Payment record not found');
  return payment;
};

const getPaymentsByOrderId = async (orderId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order not found');

  return paymentRepository.findByOrderId(orderId);
};

module.exports = {
  processPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByOrderId
};
