const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTestData() {
  console.log('🧹 Starting cleanup of test data and duplicates in database...');

  try {
    // 1. Delete transient test transactions & activity logs
    console.log('Deleting test orders, payments, and reservations...');
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.reservation.deleteMany({});

    // 2. Delete test OCR invoices & expenses
    console.log('Deleting test invoices and expense entries...');
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.supplierInvoiceItem.deleteMany({});
    await prisma.supplierInvoice.deleteMany({});
    await prisma.expense.deleteMany({});

    // 3. Delete test purchase orders & items
    console.log('Deleting test purchase orders...');
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});

    // 4. Delete test stock transactions & waste logs
    console.log('Deleting test stock transactions & waste logs...');
    await prisma.stockTransaction.deleteMany({});
    await prisma.foodWasteLog.deleteMany({});
    await prisma.activityLog.deleteMany({});
    await prisma.auditLog.deleteMany({});

    // 5. Reset Table Status to AVAILABLE and clear customer links
    console.log('Resetting restaurant tables status to AVAILABLE...');
    await prisma.restaurantTable.updateMany({
      data: {
        status: 'AVAILABLE',
        customerId: null,
      },
    });

    // 6. Clean duplicate customers (keep unique emails/phones)
    console.log('Cleaning test customers...');
    const allCustomers = await prisma.customer.findMany({ orderBy: { createdAt: 'asc' } });
    const seenEmails = new Set();
    const seenPhones = new Set();
    for (const c of allCustomers) {
      if ((c.email && seenEmails.has(c.email)) || (c.phone && seenPhones.has(c.phone))) {
        await prisma.customer.delete({ where: { id: c.id } });
      } else {
        if (c.email) seenEmails.add(c.email);
        if (c.phone) seenPhones.add(c.phone);
      }
    }

    // 7. Clean duplicate Menu Items
    console.log('Cleaning duplicate menu items...');
    const allMenuItems = await prisma.menuItem.findMany({ orderBy: { createdAt: 'asc' } });
    const seenItemNames = new Set();
    for (const item of allMenuItems) {
      if (seenItemNames.has(item.name.toLowerCase().trim())) {
        // Delete recipe if associated
        await prisma.recipe.deleteMany({ where: { menuItemId: item.id } });
        await prisma.menuItem.delete({ where: { id: item.id } });
      } else {
        seenItemNames.add(item.name.toLowerCase().trim());
      }
    }

    // 8. Clean duplicate Ingredients
    console.log('Cleaning duplicate ingredients...');
    const allIngredients = await prisma.ingredient.findMany({ orderBy: { createdAt: 'asc' } });
    const seenIngNames = new Set();
    for (const ing of allIngredients) {
      if (seenIngNames.has(ing.name.toLowerCase().trim())) {
        await prisma.stock.deleteMany({ where: { ingredientId: ing.id } });
        await prisma.recipeIngredient.deleteMany({ where: { ingredientId: ing.id } });
        await prisma.ingredient.delete({ where: { id: ing.id } });
      } else {
        seenIngNames.add(ing.name.toLowerCase().trim());
      }
    }

    console.log('✨ All test data and duplicate entries successfully cleaned!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestData();
