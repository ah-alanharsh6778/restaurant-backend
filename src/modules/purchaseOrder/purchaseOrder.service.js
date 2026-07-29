const purchaseOrderRepository = require('./purchaseOrder.repository');
const ocrService = require('../invoice/ocr.service');
const invoiceParser = require('../invoice/invoice.parser');
const emailService = require('../../utils/email.service');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { PurchaseOrderDTO } = require('../../dtos');

class PurchaseOrderService {
  async createPurchaseOrder(data) {
    const {
      supplierId,
      warehouseId,
      items,
      expectedDelivery,
      notes,
      status = 'DRAFT',
      paymentStatus = 'PENDING',
      gstAmount = 0,
      discountAmount = 0,
      shippingAmount = 0
    } = data;

    if (!supplierId) {
      throw new BadRequestError('supplierId is required');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Purchase order items are required and must not be empty');
    }

    // Verify Supplier Exists
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, isDeleted: false }
    });

    if (!supplier) {
      throw new NotFoundError('Supplier not found or has been deleted');
    }

    // Verify Warehouse if provided
    if (warehouseId) {
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouseId, isDeleted: false }
      });
      if (!warehouse) {
        throw new NotFoundError('Warehouse not found or has been deleted');
      }
    }

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const { ingredientId, productId, quantity, price } = item;

      if (!ingredientId && !productId) {
        throw new BadRequestError('Each purchase order item must contain either ingredientId or productId');
      }

      const qty = parseFloat(quantity);
      const unitPrice = parseFloat(price);

      if (isNaN(qty) || qty <= 0) {
        throw new BadRequestError('Item quantity must be a positive number');
      }

      if (isNaN(unitPrice) || unitPrice < 0) {
        throw new BadRequestError('Item price must be a valid non-negative number');
      }

      if (ingredientId) {
        const ingredient = await prisma.ingredient.findFirst({
          where: { id: ingredientId, isDeleted: false }
        });
        if (!ingredient) {
          throw new NotFoundError(`Ingredient with ID ${ingredientId} not found`);
        }
      }

      if (productId) {
        const product = await prisma.product.findFirst({
          where: { id: productId, isDeleted: false }
        });
        if (!product) {
          throw new NotFoundError(`Product with ID ${productId} not found`);
        }
      }

      const itemSubtotal = qty * unitPrice;
      subtotal += itemSubtotal;

      processedItems.push({
        ingredientId: ingredientId || null,
        productId: productId || null,
        quantity: qty,
        price: unitPrice,
        subtotal: itemSubtotal
      });
    }

    const parsedGst = parseFloat(gstAmount) || 0;
    const parsedDiscount = parseFloat(discountAmount) || 0;
    const parsedShipping = parseFloat(shippingAmount) || 0;
    const grandTotal = subtotal + parsedGst + parsedShipping - parsedDiscount;

    // Auto-generate PO Number: PO-20260001
    const poNumber = await purchaseOrderRepository.findNextPoNumber();

    const poData = {
      poNumber,
      supplierId,
      warehouseId: warehouseId || null,
      status: status || 'DRAFT',
      paymentStatus: paymentStatus || 'PENDING',
      subtotal,
      gstAmount: parsedGst,
      discountAmount: parsedDiscount,
      shippingAmount: parsedShipping,
      grandTotal,
      totalAmount: grandTotal,
      notes: notes || null,
      expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null
    };

    const createdPo = await purchaseOrderRepository.create(poData, processedItems);
    return new PurchaseOrderDTO(createdPo);
  }

  async getAllPurchaseOrders(query = {}) {
    const { page = 1, limit = 50, supplierId, warehouseId, status, paymentStatus, search } = query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const { items, total } = await purchaseOrderRepository.findAll({
      skip,
      take,
      supplierId,
      warehouseId,
      status,
      paymentStatus,
      search
    });

    return {
      purchaseOrders: items.map((po) => new PurchaseOrderDTO(po)),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / take)
      }
    };
  }

  async getPurchaseOrderById(id) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }
    return new PurchaseOrderDTO(po);
  }

  async updatePurchaseOrder(id, data) {
    const existingPo = await purchaseOrderRepository.findById(id);
    if (!existingPo) {
      throw new NotFoundError('Purchase Order not found');
    }

    if (existingPo.status === 'RECEIVED' || existingPo.status === 'CANCELLED') {
      throw new BadRequestError(`Cannot edit a Purchase Order with status '${existingPo.status}'`);
    }

    if (data.supplierId && data.supplierId !== existingPo.supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: { id: data.supplierId, isDeleted: false }
      });
      if (!supplier) {
        throw new NotFoundError('Supplier not found or has been deleted');
      }
    }

    const supplierId = data.supplierId || existingPo.supplierId;
    const warehouseId = 'warehouseId' in data ? (data.warehouseId || null) : existingPo.warehouseId;

    if (warehouseId && warehouseId !== existingPo.warehouseId) {
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouseId, isDeleted: false }
      });
      if (!warehouse) {
        throw new NotFoundError('Warehouse not found or has been deleted');
      }
    }

    const { items, expectedDelivery, notes, gstAmount, discountAmount, shippingAmount } = data;

    let subtotal = existingPo.subtotal;
    let processedItems = null;

    if (items && Array.isArray(items) && items.length > 0) {
      subtotal = 0;
      processedItems = [];

      for (const item of items) {
        const { ingredientId, productId, quantity, price } = item;

        if (!ingredientId && !productId) {
          throw new BadRequestError('Each purchase order item must contain either ingredientId or productId');
        }

        const qty = parseFloat(quantity);
        const unitPrice = parseFloat(price);
        if (isNaN(qty) || qty <= 0) {
          throw new BadRequestError('Item quantity must be a positive number');
        }
        if (isNaN(unitPrice) || unitPrice < 0) {
          throw new BadRequestError('Item price must be a non-negative number');
        }

        if (ingredientId) {
          const ingredient = await prisma.ingredient.findFirst({
            where: { id: ingredientId, isDeleted: false }
          });
          if (!ingredient) {
            throw new NotFoundError(`Ingredient with ID ${ingredientId} not found`);
          }
        }

        if (productId) {
          const product = await prisma.product.findFirst({
            where: { id: productId, isDeleted: false }
          });
          if (!product) {
            throw new NotFoundError(`Product with ID ${productId} not found`);
          }
        }

        const itemSubtotal = qty * unitPrice;
        subtotal += itemSubtotal;

        processedItems.push({
          ingredientId: ingredientId || null,
          productId: productId || null,
          quantity: qty,
          price: unitPrice,
          subtotal: itemSubtotal
        });
      }
    }

    const parsedGst = gstAmount !== undefined && gstAmount !== null ? parseFloat(gstAmount) : existingPo.gstAmount;
    const parsedDiscount = discountAmount !== undefined && discountAmount !== null ? parseFloat(discountAmount) : existingPo.discountAmount;
    const parsedShipping = shippingAmount !== undefined && shippingAmount !== null ? parseFloat(shippingAmount) : existingPo.shippingAmount;
    const grandTotal = subtotal + (parsedGst || 0) + (parsedShipping || 0) - (parsedDiscount || 0);

    const poData = {
      supplierId,
      warehouseId,
      subtotal,
      gstAmount: parsedGst || 0,
      discountAmount: parsedDiscount || 0,
      shippingAmount: parsedShipping || 0,
      grandTotal,
      totalAmount: grandTotal,
      notes: notes !== undefined ? (notes || null) : existingPo.notes,
      expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : existingPo.expectedDelivery
    };

    const updatedPo = await purchaseOrderRepository.update(id, poData, processedItems);
    return new PurchaseOrderDTO(updatedPo);
  }

  async approvePurchaseOrder(id) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    if (po.status === 'CANCELLED') {
      throw new BadRequestError('Cannot approve a CANCELLED Purchase Order');
    }

    const updatedPo = await purchaseOrderRepository.updateStatus(id, 'APPROVED');
    
    // Dispatch Email Notification to Supplier if email is available
    if (updatedPo.supplier && updatedPo.supplier.email) {
      emailService.sendPurchaseOrderEmail(updatedPo.supplier.email, updatedPo.poNumber, updatedPo);
    }

    return new PurchaseOrderDTO(updatedPo);
  }

  async updateStatus(id, status) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    const validStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updatedPo = await purchaseOrderRepository.updateStatus(id, status);
    return new PurchaseOrderDTO(updatedPo);
  }

  async updatePaymentStatus(id, paymentStatus) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    const validPaymentStatuses = ['PENDING', 'PARTIAL', 'PAID'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new BadRequestError(`Invalid payment status '${paymentStatus}'`);
    }

    const updatedPo = await purchaseOrderRepository.updatePaymentStatus(id, paymentStatus);
    return new PurchaseOrderDTO(updatedPo);
  }

  async receiveItems(id, receiveData) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    if (po.status === 'CANCELLED') {
      throw new BadRequestError('Cannot receive items for a CANCELLED Purchase Order');
    }

    const { warehouseId, receivedItems } = receiveData;
    const targetWarehouseId = warehouseId || po.warehouseId;

    if (!targetWarehouseId) {
      throw new BadRequestError('warehouseId is required to process stock receipt into inventory');
    }

    if (!receivedItems || !Array.isArray(receivedItems) || receivedItems.length === 0) {
      throw new BadRequestError('receivedItems array is required to receive inventory');
    }

    const updatedPo = await purchaseOrderRepository.receiveItemsTransaction(id, targetWarehouseId, receivedItems);
    return new PurchaseOrderDTO(updatedPo);
  }

  /**
   * Upload Supplier Invoice File for PO, run AI OCR, link Invoice, and AUTO-CREATE Expense
   */
  async uploadSupplierInvoice(id, file) {
    if (!file) {
      throw new BadRequestError('Invoice file is required for upload');
    }

    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    const normalizedPath = file.path.replace(/\\/g, '/');
    let rawText = '';
    let extractedData = {};

    try {
      rawText = await ocrService.processImageOrPdf(normalizedPath, file.mimetype);
      extractedData = await invoiceParser.parseOCRTextToJSON(rawText);
    } catch (err) {
      // Fallback extraction
      extractedData = {
        invoiceNumber: `INV-PO-${po.poNumber}-${Date.now().toString().slice(-4)}`,
        supplierName: po.supplier ? po.supplier.name : 'Supplier',
        subtotal: po.subtotal,
        taxAmount: po.gstAmount,
        totalAmount: po.grandTotal
      };
    }

    const fileData = { normalizedPath, mimetype: file.mimetype };
    const { invoice, expense } = await purchaseOrderRepository.uploadSupplierInvoiceTransaction(id, fileData, extractedData);

    return {
      success: true,
      message: `Supplier Invoice #${invoice.invoiceNumber} uploaded & Expense auto-created in PostgreSQL`,
      data: {
        invoice,
        expense
      }
    };
  }

  /**
   * Record Payment for PO & Update Payment Status
   */
  async createPayment(id, paymentData) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    const result = await purchaseOrderRepository.createPaymentTransaction(id, paymentData);

    if (result.purchaseOrder?.supplier?.email) {
      emailService.sendPaymentNotificationEmail(
        result.purchaseOrder.supplier.email,
        result.purchaseOrder.poNumber,
        result.amountPaid,
        result.newPaymentStatus
      );
    }

    return {
      success: true,
      message: `Payment of $${result.amountPaid} recorded. PO Payment Status updated to '${result.newPaymentStatus}'`,
      data: new PurchaseOrderDTO(result.purchaseOrder)
    };
  }

  /**
   * Generate Printable HTML Document for Purchase Order
   */
  async getPrintData(id) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    const supplierName = po.supplier ? po.supplier.name : 'N/A';
    const supplierContact = po.supplier ? (po.supplier.contactPerson || po.supplier.phone) : 'N/A';
    const warehouseName = po.warehouse ? po.warehouse.name : 'Main Warehouse';

    const itemsHtml = (po.purchaseItems || []).map(item => {
      const name = item.ingredient ? item.ingredient.name : (item.product ? item.product.name : 'Item');
      const unit = item.ingredient ? item.ingredient.unit : (item.product ? item.product.unit : 'unit');
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity} ${unit}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">$${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Order - ${po.poNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 30px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
          .title { font-size: 24px; font-weight: bold; color: #2563eb; }
          .details { margin-top: 20px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-top: 25px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 13px; text-transform: uppercase; }
          .totals { margin-top: 20px; float: right; width: 300px; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .grand-total { font-size: 18px; font-weight: bold; color: #1e293b; border-top: 2px solid #cbd5e1; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">RESTAURANTOS PROCUREMENT</div>
            <div>Enterprise Inventory & Stock Management</div>
          </div>
          <div style="text-align: right;">
            <h2>PURCHASE ORDER</h2>
            <div style="font-weight: bold; font-size: 16px;">${po.poNumber}</div>
            <div>Date: ${new Date(po.createdAt).toLocaleDateString()}</div>
            <div>Status: <strong>${po.status}</strong></div>
          </div>
        </div>

        <div class="details">
          <div>
            <h3>SUPPLIER VENDOR:</h3>
            <strong>${supplierName}</strong><br/>
            Contact: ${supplierContact}<br/>
            Email: ${po.supplier ? po.supplier.email : 'N/A'}<br/>
            GST: ${po.supplier ? (po.supplier.gstNumber || 'N/A') : 'N/A'}
          </div>
          <div style="text-align: right;">
            <h3>SHIP TO WAREHOUSE:</h3>
            <strong>${warehouseName}</strong><br/>
            ${po.warehouse ? (po.warehouse.location || '') : ''}<br/>
            Expected Delivery: ${po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : 'Immediate'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row"><span>Subtotal:</span><span>$${po.subtotal.toFixed(2)}</span></div>
          <div class="totals-row"><span>GST / Tax:</span><span>$${po.gstAmount.toFixed(2)}</span></div>
          <div class="totals-row"><span>Shipping:</span><span>$${po.shippingAmount.toFixed(2)}</span></div>
          <div class="totals-row"><span>Discount:</span><span>-$${po.discountAmount.toFixed(2)}</span></div>
          <div class="totals-row grand-total"><span>Grand Total:</span><span>$${po.grandTotal.toFixed(2)}</span></div>
        </div>
      </body>
      </html>
    `;

    return { poNumber: po.poNumber, html, data: new PurchaseOrderDTO(po) };
  }

  /**
   * Generate PDF Document Data
   */
  async getPdfData(id) {
    const printData = await this.getPrintData(id);
    return {
      poNumber: printData.poNumber,
      format: 'pdf',
      html: printData.html,
      purchaseOrder: printData.data
    };
  }

  async deletePurchaseOrder(id) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    await purchaseOrderRepository.softDelete(id);
    return { success: true, message: `Purchase Order ${po.poNumber} deleted successfully` };
  }
}

module.exports = new PurchaseOrderService();
