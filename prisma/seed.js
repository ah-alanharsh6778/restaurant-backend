const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Enterprise RestaurantOS Database...');

  // 1. Roles
  console.log('Creating Roles...');
  const roleData = [
    { name: 'ADMIN', description: 'Full System Administrator Access' },
    { name: 'MANAGER', description: 'Restaurant Operations Manager' },
    { name: 'CHEF', description: 'Kitchen Head & Recipe Manager' },
    { name: 'WAITER', description: 'Dining Room Order & Table Service' },
    { name: 'STAFF', description: 'General Support Staff' },
    { name: 'INVENTORY_MANAGER', description: 'Warehouse & Stock Manager' }
  ];

  const roles = {};
  for (const r of roleData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r
    });
    roles[r.name] = role;
  }

  // 2. Enterprise RBAC Permissions
  console.log('Creating Permissions & RolePermissions...');
  const permissionData = [
    { name: 'Create Order', action: 'CREATE', resource: 'ORDERS', description: 'Ability to create dining orders' },
    { name: 'Read Order', action: 'READ', resource: 'ORDERS', description: 'Ability to view order details' },
    { name: 'Update Order', action: 'UPDATE', resource: 'ORDERS', description: 'Ability to modify order items/status' },
    { name: 'Delete Order', action: 'DELETE', resource: 'ORDERS', description: 'Ability to cancel or delete orders' },
    { name: 'Manage Inventory', action: 'MANAGE', resource: 'INVENTORY', description: 'Full access to stock & products' },
    { name: 'Manage Staff', action: 'MANAGE', resource: 'STAFF', description: 'Ability to manage staff profiles' },
    { name: 'View Financials', action: 'READ', resource: 'EXPENSES', description: 'View expenses and revenues' },
    { name: 'Manage Users', action: 'MANAGE', resource: 'USERS', description: 'Manage user accounts and roles' }
  ];

  for (const p of permissionData) {
    const perm = await prisma.permission.upsert({
      where: { name: p.name },
      update: { action: p.action, resource: p.resource, description: p.description },
      create: p
    });

    // Map permissions to Admin & Manager roles
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roles['ADMIN'].id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: roles['ADMIN'].id,
        permissionId: perm.id
      }
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roles['MANAGER'].id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: roles['MANAGER'].id,
        permissionId: perm.id
      }
    });
  }

  // 3. Password & Users
  console.log('Creating Users & Staff Profiles...');
  const defaultPassword = await bcrypt.hash('Admin@123456', 10);
  const harshPassword = await bcrypt.hash('Harsh@123', 10);

  const usersData = [
    { fullName: 'System Administrator', email: 'admin@restaurant.com', passwordHash: defaultPassword, roleName: 'ADMIN', empCode: 'EMP-001', dept: 'Executive', desig: 'System Administrator' },
    { fullName: 'Harsh Admin User', email: 'harsh@gmail.com', passwordHash: harshPassword, roleName: 'ADMIN', empCode: 'EMP-000', dept: 'Executive', desig: 'Lead Administrator' },
    { fullName: 'Sarah Operations Manager', email: 'manager@restaurant.com', passwordHash: defaultPassword, roleName: 'MANAGER', empCode: 'EMP-002', dept: 'Management', desig: 'General Manager' },
    { fullName: 'Executive Chef Gordon', email: 'chef@restaurant.com', passwordHash: defaultPassword, roleName: 'CHEF', empCode: 'EMP-003', dept: 'Kitchen', desig: 'Head Chef' },
    { fullName: 'John Waiter', email: 'waiter@restaurant.com', passwordHash: defaultPassword, roleName: 'WAITER', empCode: 'EMP-004', dept: 'Service', desig: 'Senior Waiter' },
    { fullName: 'Mark Inventory Lead', email: 'inventory@restaurant.com', passwordHash: defaultPassword, roleName: 'INVENTORY_MANAGER', empCode: 'EMP-005', dept: 'Warehouse', desig: 'Stock Controller' }
  ];

  const createdUsers = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, password: u.passwordHash },
      create: {
        fullName: u.fullName,
        email: u.email,
        password: u.passwordHash,
        roleId: roles[u.roleName].id
      }
    });
    createdUsers[u.email] = user;


    await prisma.staff.upsert({
      where: { userId: user.id },
      update: { department: u.dept, designation: u.desig },
      create: {
        userId: user.id,
        employeeCode: u.empCode,
        department: u.dept,
        designation: u.desig,
        shift: 'MORNING',
        hireDate: new Date('2025-01-01'),
        salary: 45000.0,
        emergencyContact: '+1-555-0199'
      }
    });
  }

  // 4. Customers
  console.log('Creating Customers...');
  const customer1 = await prisma.customer.upsert({
    where: { email: 'customer.john@example.com' },
    update: { loyaltyPoints: 120 },
    create: {
      fullName: 'John VIP Customer',
      email: 'customer.john@example.com',
      phone: '+1-555-8888',
      loyaltyPoints: 120
    }
  });

  // 5. Dining Tables
  console.log('Creating Dining Tables...');
  const tablesData = [
    { tableNumber: 'T-01', capacity: 2, status: 'AVAILABLE' },
    { tableNumber: 'T-02', capacity: 4, status: 'OCCUPIED' },
    { tableNumber: 'T-03', capacity: 4, status: 'AVAILABLE' },
    { tableNumber: 'T-04', capacity: 6, status: 'RESERVED' },
    { tableNumber: 'VIP-1', capacity: 8, status: 'AVAILABLE' }
  ];

  for (const t of tablesData) {
    await prisma.restaurantTable.upsert({
      where: { tableNumber: t.tableNumber },
      update: { capacity: t.capacity, status: t.status },
      create: t
    });
  }

  // 6. Menu Categories & Items
  console.log('Creating Menu Categories & Menu Items...');
  const starersCat = await prisma.menuCategory.upsert({
    where: { name: 'Starters' },
    update: { description: 'Appetizers and quick bites' },
    create: { name: 'Starters', description: 'Appetizers and quick bites' }
  });

  const mainCat = await prisma.menuCategory.upsert({
    where: { name: 'Main Course' },
    update: { description: 'Delicious primary entrees' },
    create: { name: 'Main Course', description: 'Delicious primary entrees' }
  });

  const item1 = await prisma.menuItem.create({
    data: {
      name: 'Paneer Tikka Special',
      description: 'Charcoal grilled cottage cheese with Indian spices',
      price: 280.0,
      isAvailable: true,
      categoryId: starersCat.id
    }
  });

  const item2 = await prisma.menuItem.create({
    data: {
      name: 'Butter Chicken Grand',
      description: 'Tender chicken cooked in rich makhani gravy',
      price: 420.0,
      isAvailable: true,
      categoryId: mainCat.id
    }
  });

  // 7. Ingredients & Dish Recipes
  console.log('Creating Raw Ingredients & Recipes...');
  const paneerIng = await prisma.ingredient.upsert({
    where: { name: 'Raw Paneer' },
    update: { quantity: 45.0, costPerUnit: 180.0 },
    create: { name: 'Raw Paneer', unit: 'KG', quantity: 45.0, minimumStock: 10.0, costPerUnit: 180.0 }
  });

  const chickenIng = await prisma.ingredient.upsert({
    where: { name: 'Fresh Boneless Chicken' },
    update: { quantity: 30.0, costPerUnit: 220.0 },
    create: { name: 'Fresh Boneless Chicken', unit: 'KG', quantity: 30.0, minimumStock: 15.0, costPerUnit: 220.0 }
  });

  const recipe1 = await prisma.recipe.create({
    data: {
      name: 'Paneer Tikka Recipe',
      description: 'Recipe specifications for Paneer Tikka',
      menuItemId: item1.id,
      recipeIngredients: {
        create: [
          { ingredientId: paneerIng.id, quantity: 0.25, unit: 'KG' }
        ]
      }
    }
  });

  // 8. Suppliers, POs & Expenses
  console.log('Creating Suppliers & Expenses...');
  const supplier1 = await prisma.supplier.upsert({
    where: { name: 'Fresh Dairy & Meat Wholesale' },
    update: { contactPerson: 'Robert Miller' },
    create: {
      name: 'Fresh Dairy & Meat Wholesale',
      contactPerson: 'Robert Miller',
      phone: '+1-555-9000',
      email: 'sales@freshwholesale.com',
      address: 'Industrial Estate Zone 4',
      gstNumber: '27AAAAA1234A1Z5'
    }
  });

  const expenseCat1 = await prisma.expenseCategory.upsert({
    where: { name: 'Raw Food Supplies' },
    update: { description: 'Kitchen raw ingredient purchases' },
    create: { name: 'Raw Food Supplies', description: 'Kitchen raw ingredient purchases' }
  });

  await prisma.expense.create({
    data: {
      supplierId: supplier1.id,
      categoryId: expenseCat1.id,
      invoiceNumber: 'INV-2026-901',
      invoiceDate: new Date('2026-07-20'),
      amount: 350.0,
      tax: 35.0,
      total: 385.0,
      status: 'PAID',
      remarks: 'Weekly dairy supply invoice'
    }
  });

  // 9. Warehouses & Stock
  console.log('Creating Warehouses & Stock Entries...');
  const mainWh = await prisma.warehouse.upsert({
    where: { name: 'Main Central Cold Storage' },
    update: { location: 'Basement Facility B1' },
    create: { name: 'Main Central Cold Storage', location: 'Basement Facility B1', manager: 'Mark Inventory Lead' }
  });

  await prisma.stock.upsert({
    where: {
      ingredientId_warehouseId: {
        ingredientId: paneerIng.id,
        warehouseId: mainWh.id
      }
    },
    update: { quantity: 45.0 },
    create: {
      ingredientId: paneerIng.id,
      warehouseId: mainWh.id,
      quantity: 45.0
    }
  });

  // 10. Audit & Activity Logs
  console.log('Creating Audit & Activity Logs...');
  await prisma.activityLog.create({
    data: {
      userId: createdUsers['admin@restaurant.com'].id,
      action: 'SYSTEM_BOOT',
      module: 'AUTH',
      description: 'System database seeded and initialized successfully',
      ipAddress: '127.0.0.1'
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: createdUsers['admin@restaurant.com'].id,
      action: 'SEED_DATABASE',
      entityName: 'Role',
      entityId: roles['ADMIN'].id,
      newValues: { role: 'ADMIN', status: 'INITIALIZED' },
      ipAddress: '127.0.0.1'
    }
  });

  console.log('✅ Enterprise RestaurantOS Database Seeding Successfully Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
