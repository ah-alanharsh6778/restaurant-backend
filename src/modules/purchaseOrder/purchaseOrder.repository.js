const prisma = require('../../config/prisma');

class PurchaseOrderRepository {
  /**
   * Generates the next sequential Purchase Order Number in the format PO-YYYY0001
   */
  async findNextPoNumber() {
    const currentYear = new Date().getFullYear();
    const prefix = `PO-${currentYear}`;

    const lastPo = await prisma.purchaseOrder.findFirst({
      where: {
        poNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        poNumber: 'desc'
      },
      select: {
        poNumber: true
      }
    });

    if (!lastPo) {
      return `${prefix}0001`;
    }

    const numericPart = lastPo.poNumber.replace(prefix, '');
    const nextSeq = parseInt(numericPart, 10) + 1;
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  async create(poData, itemsData) {
    return prisma.$transaction(async (tx) => {
      const createdPo = await tx.purchaseOrder.create({
        data: {
          ...poData,
          purchaseItems: {
            create: itemsData
          }
        },
        include: {
          supplier: true,
          warehouse: true,
          purchaseItems: {
            include: {
              ingredient: true,
              product: true
            }
          }
        }
      });
      return createdPo;
    });
  }

  async findById(id) {
    return prisma.purchaseOrder.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        supplier: true,
        warehouse: true,
        purchaseItems: {
          include: {
            ingredient: true,
            product: true
          }
        },
        stockTransactions: {
          include: {
            warehouse: true
          }
        },
        supplierInvoices: {
          include: {
            supplierInvoiceItems: true
          }
        },
        expenses: true
      }
    });
  }

  async findByPoNumber(poNumber) {
    return prisma.purchaseOrder.findFirst({
      where: {
        poNumber,
        isDeleted: false
      }
    });
  }

  async findAll(options = {}) {
    const { skip, take, supplierId, warehouseId, status, paymentStatus, search } = options;
    const where = {
      isDeleted: false
    };

    if (supplierId) where.supplierId = supplierId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { poNumber: { contains: query, mode: 'insensitive' } },
        { supplier: { name: { contains: query, mode: 'insensitive' } } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: {
          supplier: true,
          warehouse: true,
          purchaseItems: {
            include: {
              ingredient: true,
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    return { items, total };
  }

  async update(id, poData, itemsData = null) {
    return prisma.$transaction(async (tx) => {
      if (itemsData && itemsData.length > 0) {
        await tx.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId: id }
        });
        await tx.purchaseOrderItem.createMany({
          data: itemsData.map(item => ({
            ...item,
            purchaseOrderId: id
          }))
        });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: poData,
        include: {
          supplier: true,
          warehouse: true,
          purchaseItems: {
            include: {
              ingredient: true,
              product: true
            }
          }
        }
      });
    });
  }

  async updateStatus(id, status) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        supplier: true,
        warehouse: true,
        purchaseItems: {
          include: { ingredient: true, product: true }
        }
      }
    });
  }

  async updatePaymentStatus(id, paymentStatus) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: { paymentStatus },
      include: {
        supplier: true,
        warehouse: true,
        purchaseItems: {
          include: { ingredient: true, product: true }
        }
      }
    });
  }

  /**
   * Atomic Prisma Transaction to receive PO stock items into target warehouse:
   * 1. Increments item.receivedQuantity
   * 2. Determines overall PO status (RECEIVED vs PARTIALLY_RECEIVED)
   * 3. Creates StockTransaction (STOCK_IN)
   * 4. Updates Ingredient / Product master quantities
   * 5. Upserts Stock record in target Warehouse
   */
  async receiveItemsTransaction(poId, targetWarehouseId, receivedItems) {
    return prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId },
        include: { purchaseItems: true }
      });

      if (!po) throw new Error('Purchase Order not found');

      const warehouseId = targetWarehouseId || po.warehouseId;
      if (!warehouseId) throw new Error('Target warehouseId is required to receive inventory');

      let allFullyReceived = true;

      for (const recItem of receivedItems) {
        const { itemId, receivedQty } = recItem;
        const qtyToReceive = parseFloat(receivedQty);

        if (qtyToReceive <= 0) continue;

        const poItem = po.purchaseItems.find(i => i.id === itemId);
        if (!poItem) continue;

        const newReceivedQty = (poItem.receivedQuantity || 0) + qtyToReceive;

        // 1. Update receivedQuantity on PO Item
        await tx.purchaseOrderItem.update({
          where: { id: itemId },
          data: { receivedQuantity: newReceivedQty }
        });

        // 2. Create StockTransaction (STOCK_IN)
        await tx.stockTransaction.create({
          data: {
            purchaseOrderId: poId,
            warehouseId,
            ingredientId: poItem.ingredientId || null,
            productId: poItem.productId || null,
            type: 'STOCK_IN',
            quantity: qtyToReceive,
            remarks: `Received ${qtyToReceive} units via Purchase Order ${po.poNumber}`
          }
        });

        // 3. Update master stock (Ingredient or Product)
        if (poItem.ingredientId) {
          await tx.ingredient.update({
            where: { id: poItem.ingredientId },
            data: { quantity: { increment: qtyToReceive } }
          });

          // Upsert Stock in Warehouse
          await tx.stock.upsert({
            where: {
              ingredientId_warehouseId: {
                ingredientId: poItem.ingredientId,
                warehouseId
              }
            },
            create: {
              ingredientId: poItem.ingredientId,
              warehouseId,
              quantity: qtyToReceive
            },
            update: {
              quantity: { increment: qtyToReceive }
            }
          });
        } else if (poItem.productId) {
          await tx.product.update({
            where: { id: poItem.productId },
            data: { currentStock: { increment: qtyToReceive } }
          });

          // Upsert Stock in Warehouse
          await tx.stock.upsert({
            where: {
              productId_warehouseId: {
                productId: poItem.productId,
                warehouseId
              }
            },
            create: {
              productId: poItem.productId,
              warehouseId,
              quantity: qtyToReceive
            },
            update: {
              quantity: { increment: qtyToReceive }
            }
          });
        }
      }

      // Re-fetch items to check overall completion status
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: poId }
      });

      for (const item of updatedPoItems) {
        if (item.receivedQuantity < item.quantity) {
          allFullyReceived = false;
          break;
        }
      }

      const finalStatus = allFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

      return tx.purchaseOrder.update({
        where: { id: poId },
        data: {
          status: finalStatus,
          warehouseId
        },
        include: {
          supplier: true,
          warehouse: true,
          purchaseItems: {
            include: { ingredient: true, product: true }
          },
          stockTransactions: true
        }
      });
    });
  }

  /**
   * Upload Supplier Invoice & Automatically Create Expense in Single Atomic Transaction
   */
  async uploadSupplierInvoiceTransaction(poId, fileData, extractedData) {
    return prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId },
        include: { supplier: true }
      });

      if (!po) throw new Error('Purchase Order not found');

      const baseInvNum = extractedData.invoiceNumber || `INV-${po.poNumber}`;
      const timestampSuffix = Date.now().toString().slice(-4);
      const invoiceNum = `${baseInvNum}-${timestampSuffix}`;

      // 1. Create SupplierInvoice
      const invoice = await tx.supplierInvoice.create({
        data: {
          invoiceNumber: invoiceNum,
          supplierId: po.supplierId,
          purchaseOrderId: poId,
          invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : new Date(),
          subtotal: extractedData.subtotal || po.subtotal,
          taxAmount: extractedData.taxAmount || po.gstAmount,
          totalAmount: extractedData.totalAmount || po.grandTotal,
          status: 'RECEIVED',
          filePath: fileData.normalizedPath
        }
      });

      // 2. Automatically Create Expense in PostgreSQL
      const expenseAmount = extractedData.totalAmount || po.grandTotal;
      const expense = await tx.expense.create({
        data: {
          invoiceNumber: invoiceNum,
          supplierId: po.supplierId,
          purchaseOrderId: poId,
          supplierInvoiceId: invoice.id,
          amount: expenseAmount,
          total: expenseAmount,
          tax: extractedData.taxAmount || po.gstAmount || 0,
          invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : new Date(),
          status: 'PROCESSED',
          filePath: fileData.normalizedPath,
          remarks: `Auto-generated expense from Supplier Invoice #${invoiceNum} (PO ${po.poNumber})`
        }
      });

      return { invoice, expense };
    });
  }

  /**
   * Record Payment & Automatically Update PO PaymentStatus in Single Atomic Transaction
   */
  async createPaymentTransaction(poId, paymentData) {
    return prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId },
        include: { expenses: true }
      });

      if (!po) throw new Error('Purchase Order not found');

      const amountPaid = parseFloat(paymentData.amountPaid);
      const newGrandTotal = po.grandTotal || po.totalAmount;
      const isFullPayment = amountPaid >= newGrandTotal;
      const newPaymentStatus = isFullPayment ? 'PAID' : 'PARTIAL';

      // 1. Update PO Payment Status
      const updatedPo = await tx.purchaseOrder.update({
        where: { id: poId },
        data: { paymentStatus: newPaymentStatus },
        include: {
          supplier: true,
          warehouse: true,
          purchaseItems: { include: { ingredient: true, product: true } },
          expenses: true,
          supplierInvoices: true
        }
      });

      // 2. Update linked expenses if full payment made
      if (isFullPayment && po.expenses && po.expenses.length > 0) {
        await tx.expense.updateMany({
          where: { purchaseOrderId: poId },
          data: { status: 'PAID' }
        });
      }

      return { purchaseOrder: updatedPo, amountPaid, newPaymentStatus };
    });
  }

  async softDelete(id) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }
}

module.exports = new PurchaseOrderRepository();
