const purchaseOrderRepository = require('./purchaseOrder.repository');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { PurchaseOrderDTO } = require('../../dtos');

const generatePoNumber = () => {
  return 'PO-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
};

const createPurchaseOrder = async (data) => {
  const { supplierId, items, expectedDelivery } = data;

  if (!supplierId) {
    throw new BadRequestError('supplierId is required');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Purchase order items are required');
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId }
  });

  if (!supplier) {
    throw new NotFoundError('Supplier not found');
  }

  let totalAmount = 0;
  const processedItems = [];

  for (const item of items) {
    const { ingredientId, quantity, price } = item;

    if (!ingredientId || !quantity || price === undefined) {
      throw new BadRequestError('ingredientId, quantity, and price are required for each item');
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!ingredient) {
      throw new NotFoundError(`Ingredient with id ${ingredientId} not found`);
    }

    const qty = parseFloat(quantity);
    const unitPrice = parseFloat(price);
    const subtotal = qty * unitPrice;
    totalAmount += subtotal;

    processedItems.push({
      ingredientId,
      quantity: qty,
      price: unitPrice,
      subtotal
    });
  }

  const poNumber = generatePoNumber();

  const po = await purchaseOrderRepository.create(
    {
      poNumber,
      supplierId,
      status: data.status || 'PENDING',
      totalAmount,
      expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null
    },
    processedItems
  );

  return new PurchaseOrderDTO(po);
};

const getAllPurchaseOrders = async (query = {}) => {
  const { page = 1, limit = 50, supplierId, status } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await purchaseOrderRepository.findAll({ skip, take, supplierId, status });

  return {
    purchaseOrders: items.map((po) => new PurchaseOrderDTO(po)),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getPurchaseOrderById = async (id) => {
  const po = await purchaseOrderRepository.findById(id);

  if (!po) {
    throw new NotFoundError('Purchase order not found');
  }

  return new PurchaseOrderDTO(po);
};

const updatePurchaseOrderStatus = async (id, data) => {
  const { status } = data;

  if (!status) {
    throw new BadRequestError('Status is required');
  }

  const existingPo = await purchaseOrderRepository.findById(id);

  if (!existingPo) {
    throw new NotFoundError('Purchase order not found');
  }

  // Automated Stock Receipt Engine when PO changes to RECEIVED
  const itemsToReceive = [];

  if (status === 'RECEIVED' && existingPo.status !== 'RECEIVED') {
    for (const item of existingPo.purchaseItems) {
      itemsToReceive.push({
        ingredientId: item.ingredientId,
        quantity: item.quantity
      });
    }
  }

  const updatedPo = await purchaseOrderRepository.updateStatusAndReceiveStock(
    id,
    status,
    itemsToReceive
  );

  return new PurchaseOrderDTO(updatedPo);
};

const deletePurchaseOrder = async (id) => {
  const existingPo = await purchaseOrderRepository.findById(id);

  if (!existingPo) {
    throw new NotFoundError('Purchase order not found');
  }

  await purchaseOrderRepository.delete(id);
  return { id };
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
  deletePurchaseOrder
};
