// Data Transfer Objects (DTOs) for standard response formatting and data sanitization

class UserDTO {
  constructor(user) {
    this.id = user.id;
    this.fullName = user.fullName;
    this.email = user.email;
    this.phone = user.phone || null;
    this.isActive = user.isActive;
    this.roleId = user.roleId;
    this.role = user.role ? { id: user.role.id, name: user.role.name } : null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

class TableDTO {
  constructor(table) {
    this.id = table.id;
    this.tableNumber = table.tableNumber;
    this.capacity = table.capacity;
    this.status = table.status;
    this.createdAt = table.createdAt;
    this.updatedAt = table.updatedAt;
  }
}

class MenuItemDTO {
  constructor(item) {
    this.id = item.id;
    this.name = item.name;
    this.description = item.description || null;
    this.price = item.price;
    this.isAvailable = item.isAvailable;
    this.categoryId = item.categoryId;
    this.category = item.category ? { id: item.category.id, name: item.category.name } : null;
    this.createdAt = item.createdAt;
    this.updatedAt = item.updatedAt;
  }
}

class IngredientDTO {
  constructor(ing) {
    this.id = ing.id;
    this.name = ing.name;
    this.unit = ing.unit;
    this.quantity = ing.quantity;
    this.minimumStock = ing.minimumStock;
    this.costPerUnit = ing.costPerUnit !== undefined ? ing.costPerUnit : 0;
    this.isActive = ing.isActive;
    this.createdAt = ing.createdAt;
    this.updatedAt = ing.updatedAt;
  }
}

class OrderDTO {
  constructor(order) {
    this.id = order.id;
    this.orderNumber = order.orderNumber;
    this.tableId = order.tableId;
    this.table = order.table ? new TableDTO(order.table) : null;
    this.status = order.status;
    this.totalAmount = order.totalAmount;
    this.orderItems = order.orderItems
      ? order.orderItems.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          menuItem: item.menuItem ? new MenuItemDTO(item.menuItem) : null
        }))
      : [];
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }
}

class SupplierDTO {
  constructor(supplier) {
    this.id = supplier.id;
    this.name = supplier.name;
    this.contactPerson = supplier.contactPerson;
    this.phone = supplier.phone;
    this.email = supplier.email;
    this.address = supplier.address;
    this.gstNumber = supplier.gstNumber || null;
    this.isActive = supplier.isActive;
    this.createdAt = supplier.createdAt;
    this.updatedAt = supplier.updatedAt;
  }
}

class PurchaseOrderDTO {
  constructor(po) {
    this.id = po.id;
    this.poNumber = po.poNumber;
    this.supplierId = po.supplierId;
    this.supplier = po.supplier ? new SupplierDTO(po.supplier) : null;
    this.status = po.status;
    this.totalAmount = po.totalAmount;
    this.expectedDelivery = po.expectedDelivery || null;
    this.purchaseItems = po.purchaseItems
      ? po.purchaseItems.map((item) => ({
          id: item.id,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          ingredient: item.ingredient ? new IngredientDTO(item.ingredient) : null
        }))
      : [];
    this.createdAt = po.createdAt;
    this.updatedAt = po.updatedAt;
  }
}

class ProductDTO {
  constructor(product) {
    this.id = product.id;
    this.name = product.name;
    this.sku = product.sku;
    this.categoryId = product.categoryId;
    this.category = product.category ? { id: product.category.id, name: product.category.name } : null;
    this.unit = product.unit;
    this.currentStock = product.currentStock;
    this.minimumStock = product.minimumStock;
    this.maximumStock = product.maximumStock || null;
    this.costPrice = product.costPrice;
    this.sellingPrice = product.sellingPrice;
    this.isActive = product.isActive;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

class ExpenseDTO {
  constructor(exp) {
    this.id = exp.id;
    this.supplierId = exp.supplierId || null;
    this.supplier = exp.supplier ? new SupplierDTO(exp.supplier) : null;
    this.categoryId = exp.categoryId || null;
    this.category = exp.category ? { id: exp.category.id, name: exp.category.name } : null;
    this.invoiceNumber = exp.invoiceNumber || null;
    this.invoiceDate = exp.invoiceDate || null;
    this.amount = exp.amount;
    this.tax = exp.tax;
    this.total = exp.total;
    this.status = exp.status;
    this.filePath = exp.filePath || null;
    this.remarks = exp.remarks || null;
    this.createdAt = exp.createdAt;
    this.updatedAt = exp.updatedAt;
  }
}

class InvoiceDTO {
  constructor(invoice) {
    this.id = invoice.id;
    this.invoiceNumber = invoice.invoiceNumber || null;
    this.supplierName = invoice.supplierName || null;
    this.supplierTaxId = invoice.supplierTaxId || null;
    this.clientName = invoice.clientName || null;
    this.clientTaxId = invoice.clientTaxId || null;
    this.invoiceDate = invoice.invoiceDate || null;
    this.subtotal = invoice.subtotal || 0;
    this.taxAmount = invoice.taxAmount || 0;
    this.discount = invoice.discount || 0;
    this.totalAmount = invoice.totalAmount || 0;
    this.currency = invoice.currency || 'USD';
    this.status = invoice.status;
    this.filePath = invoice.filePath;
    this.expenseId = invoice.expenseId || null;
    this.expense = invoice.expense ? new ExpenseDTO(invoice.expense) : null;
    this.items = invoice.items
      ? invoice.items.map((i) => ({
          id: i.id,
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          amount: i.amount
        }))
      : [];
    this.createdAt = invoice.createdAt;
    this.updatedAt = invoice.updatedAt;
  }
}

module.exports = {
  UserDTO,
  TableDTO,
  MenuItemDTO,
  IngredientDTO,
  OrderDTO,
  SupplierDTO,
  PurchaseOrderDTO,
  ProductDTO,
  ExpenseDTO,
  InvoiceDTO
};
