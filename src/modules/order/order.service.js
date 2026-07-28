const orderRepository = require('./order.repository');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { OrderDTO } = require('../../dtos');

const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
};

const createOrder = async (data, user) => {
  const { tableId, items, orderItems } = data;
  const itemList = items || orderItems || [];

  if (!tableId) {
    throw new BadRequestError('tableId is required');
  }

  if (!itemList || !Array.isArray(itemList) || itemList.length === 0) {
    throw new BadRequestError('Order items are required');
  }

  const table = await prisma.restaurantTable.findUnique({
    where: { id: tableId }
  });

  if (!table) {
    throw new NotFoundError('Restaurant table not found');
  }

  let totalAmount = 0;
  const processedItems = [];

  for (const item of itemList) {
    const { menuItemId, quantity } = item;

    if (!menuItemId || !quantity) {
      throw new BadRequestError('menuItemId and quantity are required for each item');
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId }
    });

    if (!menuItem) {
      throw new NotFoundError(`MenuItem with id ${menuItemId} not found`);
    }

    const qty = parseInt(quantity, 10);
    const price = menuItem.price;
    const subtotal = price * qty;
    totalAmount += subtotal;

    processedItems.push({
      menuItemId,
      quantity: qty,
      price,
      subtotal
    });
  }

  const orderNumber = generateOrderNumber();
  const waiterId = user ? user.id : null;

  const order = await orderRepository.create(
    {
      orderNumber,
      tableId,
      waiterId,
      status: data.status || 'PENDING',
      totalAmount,
      finalAmount: totalAmount
    },
    processedItems
  );

  return new OrderDTO(order);
};

const getAllOrders = async (query = {}) => {
  const { page = 1, limit = 50, status, tableId, waiterId } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await orderRepository.findAll({ skip, take, status, tableId, waiterId });

  return {
    orders: items.map((o) => new OrderDTO(o)),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getOrderById = async (id) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return new OrderDTO(order);
};

const updateOrder = async (id, data) => {
  const { status, discount, taxAmount } = data;

  const existingOrder = await orderRepository.findById(id);

  if (!existingOrder) {
    throw new NotFoundError('Order not found');
  }

  const updateFields = {};
  if (status) updateFields.status = status;
  if (discount !== undefined) updateFields.discount = parseFloat(discount);
  if (taxAmount !== undefined) updateFields.taxAmount = parseFloat(taxAmount);

  const currentTotal = existingOrder.totalAmount || 0;
  const currentDiscount = updateFields.discount !== undefined ? updateFields.discount : (existingOrder.discount || 0);
  const currentTax = updateFields.taxAmount !== undefined ? updateFields.taxAmount : (existingOrder.taxAmount || 0);
  updateFields.finalAmount = Math.max(0, parseFloat((currentTotal - currentDiscount + currentTax).toFixed(2)));

  // Stock Auto-Deduction Engine on order COMPLETED status
  const ingredientsToDeduct = [];

  if (status === 'COMPLETED' && existingOrder.status !== 'COMPLETED') {
    for (const item of existingOrder.orderItems) {
      if (item.menuItem && item.menuItem.recipe && item.menuItem.recipe.recipeIngredients) {
        for (const ri of item.menuItem.recipe.recipeIngredients) {
          const qtyToDeduct = ri.quantity * item.quantity;
          ingredientsToDeduct.push({
            ingredientId: ri.ingredientId,
            quantityToDeduct: qtyToDeduct
          });
        }
      }
    }
  }

  const updatedOrder = await orderRepository.updateOrderFields(
    id,
    updateFields,
    ingredientsToDeduct
  );

  return new OrderDTO(updatedOrder);
};

const deleteOrder = async (id) => {
  const existingOrder = await orderRepository.findById(id);

  if (!existingOrder) {
    throw new NotFoundError('Order not found');
  }

  await orderRepository.delete(id);
  return { id };
};

const addOrderItem = async (data) => {
  const { orderId, menuItemId, quantity } = data;

  if (!orderId || !menuItemId || !quantity) {
    throw new BadRequestError('orderId, menuItemId, and quantity are required');
  }

  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId }
  });

  if (!menuItem) {
    throw new NotFoundError('MenuItem not found');
  }

  const qty = parseInt(quantity, 10);
  const price = menuItem.price;
  const subtotal = price * qty;

  const orderItem = await orderRepository.addOrderItem(orderId, {
    menuItemId,
    quantity: qty,
    price,
    subtotal
  });

  // Recalculate Total
  const updatedOrder = await orderRepository.findById(orderId);
  const newTotal = updatedOrder.orderItems.reduce((acc, item) => acc + item.subtotal, 0);
  await orderRepository.updateOrderTotal(orderId, newTotal, newTotal);

  return orderItem;
};

const removeOrderItem = async (id) => {
  const existingItem = await prisma.orderItem.findUnique({
    where: { id }
  });

  if (!existingItem) {
    throw new NotFoundError('OrderItem not found');
  }

  const orderId = existingItem.orderId;
  await orderRepository.removeOrderItem(id);

  // Recalculate Total
  const updatedOrder = await orderRepository.findById(orderId);
  const newTotal = updatedOrder.orderItems ? updatedOrder.orderItems.reduce((acc, item) => acc + item.subtotal, 0) : 0;
  await orderRepository.updateOrderTotal(orderId, newTotal, newTotal);

  return { id };
};

const getInvoicePdfData = async (id) => {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const orderItemsHtml = (order.orderItems || []).map((item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; font-weight: 600;">${item.menuItem?.name || 'Dish Item'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: right;">$${(item.price || 0).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 700;">$${(item.subtotal || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${order.orderNumber}</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #F8FAFC; color: #1E293B; margin: 0; padding: 32px; }
          .receipt-box { max-width: 650px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; box-shadow: 0 12px 36px rgba(0,0,0,0.08); border: 1px solid #E2E8F0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 24px; margin-bottom: 24px; }
          .brand { font-size: 26px; font-weight: 900; color: #4F46E5; letter-spacing: -0.5px; }
          .status { background: #DCFCE7; color: #166534; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 13px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { background: #F8FAFC; padding: 12px; text-align: left; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748B; border-bottom: 2px solid #E2E8F0; }
          .totals { margin-top: 28px; text-align: right; border-top: 1px solid #E2E8F0; padding-top: 20px; }
          .totals div { margin-bottom: 8px; font-size: 14px; color: #475569; }
          .grand-total { font-size: 22px; font-weight: 900; color: #4F46E5; margin-top: 14px; border-top: 2px solid #E2E8F0; padding-top: 14px; }
          .footer { text-align: center; margin-top: 40px; font-size: 13px; color: #94A3B8; font-weight: 600; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div>
              <div class="brand">RestaurantOS</div>
              <div style="font-size: 14px; color: #64748B; margin-top: 4px; font-weight: 600;">Table ${order.table?.tableNumber || 'N/A'} • Guest Dining Receipt</div>
            </div>
            <div>
              <span class="status">${order.status}</span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748B; margin-bottom: 20px;">
            <div><strong>Order Number:</strong> ${order.orderNumber}</div>
            <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div>Subtotal: <strong>$${(order.totalAmount || 0).toFixed(2)}</strong></div>
            <div>Tax (10%): <strong>$${(order.taxAmount || 0).toFixed(2)}</strong></div>
            <div>Discount Applied: <strong>-$${(order.discount || 0).toFixed(2)}</strong></div>
            <div class="grand-total">Total Paid: $${(order.finalAmount || 0).toFixed(2)}</div>
          </div>
          <div class="footer">
            Thank you for dining with us at RestaurantOS!<br/>
            Scan QR Code on table to order again or explore our seasonal chef recommendations.
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    tableNumber: order.table?.tableNumber || 'N/A',
    totalAmount: order.totalAmount,
    taxAmount: order.taxAmount,
    discount: order.discount,
    finalAmount: order.finalAmount,
    status: order.status,
    createdAt: order.createdAt,
    items: order.orderItems,
    html
  };
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  addOrderItem,
  removeOrderItem,
  getInvoicePdfData
};
