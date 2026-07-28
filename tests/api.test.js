const request = require('supertest');
const app = require('../src/app');

describe('RestaurantOS Backend Comprehensive Integration Test Suite', () => {
  let adminToken = '';

  it('GET /api/health - should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toEqual('RestaurantOS Backend Running');
  });

  it('POST /api/auth/login - should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid@restaurant.com', password: 'WrongPassword' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login - should authenticate admin user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@restaurant.com', password: 'Admin@123456' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    adminToken = res.body.data.accessToken;
  });

  it('POST /api/auth/login - should authenticate harsh@gmail.com user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'harsh@gmail.com', password: 'Harsh@123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toEqual('harsh@gmail.com');
  });


  it('GET /api/users/profile - should fetch current authenticated admin user profile', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('email', 'admin@restaurant.com');
  });

  it('GET /api/tables - should fetch all dining tables', async () => {
    const res = await request(app)
      .get('/api/tables')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/menu/categories - should fetch menu categories', async () => {
    const res = await request(app)
      .get('/api/menu/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/menu - should fetch menu items', async () => {
    const res = await request(app)
      .get('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/orders - should fetch order list', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/ai/predict-stock - should return AI stock consumption predictions', async () => {
    const res = await request(app)
      .get('/api/ai/predict-stock')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/ai/prep-time - should estimate kitchen preparation time', async () => {
    const res = await request(app)
      .get('/api/ai/prep-time')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('estimatedPrepTimeMinutes');
  });

  it('GET /api/dashboard/sales-overview - should return dashboard sales aggregate', async () => {
    const res = await request(app)
      .get('/api/dashboard/sales-overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalRevenue');
  });

  it('GET /api/dashboard/profit - should return dashboard profit metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard/profit')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('netProfit');
  });

  it('GET /api/suppliers - should return suppliers list', async () => {
    const res = await request(app)
      .get('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/expenses - should return operational expenses', async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/notifications/my-notifications - should return current user notifications', async () => {
    const res = await request(app)
      .get('/api/notifications/my-notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/invoices - should fetch invoices list', async () => {
    const res = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('invoices');
  });

  it('POST /api/invoices/upload - should immediately auto-process file to PROCESSED status and create Expense + Items', async () => {
    const uploadRes = await request(app)
      .post('/api/invoices/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('INVOICE #INV-TEST-99001\nSupplier: Test Wholesale Corp\nTotal: $150.00'), 'test_invoice.pdf');

    expect(uploadRes.statusCode).toEqual(201);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.data.status).toEqual('PROCESSED');
    expect(uploadRes.body.data).toHaveProperty('expenseId');
    const invoiceId = uploadRes.body.data.id;

    // Reprocess test
    const reprocessRes = await request(app)
      .post(`/api/invoices/${invoiceId}/reprocess`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(reprocessRes.statusCode).toEqual(200);
    expect(reprocessRes.body.data.status).toEqual('PROCESSED');

    // Delete test
    await request(app)
      .delete(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  it('POST /api/invoices/upload - should auto-process sample attached invoice (#51109338) and reject duplicates with HTTP 409 Conflict', async () => {
    const uniqueSeller = `Andrews Kirby ${Date.now()}`;
    const sampleText = `Invoice no: 51109338
Date of issue: 04/13/2013
Seller: ${uniqueSeller}
Tax Id: 945-82-2137
Client: Becker Ltd
Tax Id: 942-80-0517

1. CLEARANCE! Fast Dell Desktop Computer 3,00 each 209,00 627,00
2. HP T520 Thin Client Computer 5,00 each 37,75 188,75
3. gaming pc desktop computer 1,00 each 400,00 400,00
4. 12-Core Gaming Computer Desktop 3,00 each 464,89 1394,67
5. Custom Build Dell Optiplex 9020 5,00 each 221,99 1109,95
6. Dell Optiplex 990 MT Computer 4,00 each 269,95 1079,80
7. Dell Core 2 Duo Desktop Computer 5,00 each 168,00 840,00

Net worth: 5640,17
VAT: 564,02
Gross worth: 6204,19`;

    // 1. Upload sample invoice
    const uploadRes = await request(app)
      .post('/api/invoices/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(sampleText), 'Invoice_51109338.pdf');

    expect(uploadRes.statusCode).toEqual(201);
    expect(uploadRes.body.data.invoiceNumber).toEqual('51109338');
    expect(uploadRes.body.data.supplierName).toEqual(uniqueSeller);
    expect(uploadRes.body.data.totalAmount).toEqual(6204.19);
    expect(uploadRes.body.data.status).toEqual('PROCESSED');
    expect(uploadRes.body.data.items.length).toBeGreaterThanOrEqual(7);
    expect(uploadRes.body.data).toHaveProperty('expenseId');

    // 2. Test Duplicate Detection Block (Issue #1: Must return HTTP 409 Conflict)
    const duplicateUploadRes = await request(app)
      .post('/api/invoices/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(sampleText), 'Invoice_51109338_Copy.pdf');

    expect(duplicateUploadRes.statusCode).toEqual(409);
    expect(duplicateUploadRes.body.success).toBe(false);
    expect(duplicateUploadRes.body.message).toContain('Duplicate Invoice');
  });

  it('POST /api/invoices/upload - should reject invalid file extensions (.exe)', async () => {
    const res = await request(app)
      .post('/api/invoices/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('executable binary code'), 'malicious.exe');

    expect(res.statusCode).toEqual(422);
    expect(res.body.success).toBe(false);
  });

  it('Ingredient & Stock Management Workflow - should Create, Read, Update, Increment via PO and Decrement via Waste', async () => {
    // 1. Create Ingredient
    const ingName = `Test Ingredient ${Date.now()}`;
    const createRes = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: ingName,
        unit: 'KG',
        quantity: 50,
        minimumStock: 10,
        costPerUnit: 4.5,
        isActive: true
      });

    expect(createRes.statusCode).toEqual(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.name).toEqual(ingName);
    expect(createRes.body.data.costPerUnit).toEqual(4.5);
    const ingId = createRes.body.data.id;

    // 2. Fetch Ingredient by ID
    const getRes = await request(app)
      .get(`/api/ingredients/${ingId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body.data.quantity).toEqual(50);

    // 3. Update Ingredient
    const updateRes = await request(app)
      .put(`/api/ingredients/${ingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        minimumStock: 15,
        costPerUnit: 5.0
      });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.data.minimumStock).toEqual(15);
    expect(updateRes.body.data.costPerUnit).toEqual(5.0);

    // 4. Log Food Waste → Stock Decrements automatically
    const wasteRes = await request(app)
      .post('/api/waste')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ingredientId: ingId,
        quantity: 5,
        unit: 'KG',
        reason: 'SPOILED',
        remarks: 'Test spoilage'
      });

    expect(wasteRes.statusCode).toEqual(201);

    // 5. Verify quantity decremented from 50 to 45
    const verifyDecRes = await request(app)
      .get(`/api/ingredients/${ingId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(verifyDecRes.body.data.quantity).toEqual(45);

    // 6. Delete Ingredient
    const delRes = await request(app)
      .delete(`/api/ingredients/${ingId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(delRes.statusCode).toEqual(200);
  });

  it('Table QR Ordering Workflow - Public Table Fetch, Order Placement, Auto-Occupancy, and Invoice PDF Generation', async () => {
    // 1. Fetch all tables to get a valid table ID
    const tablesRes = await request(app)
      .get('/api/tables')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(tablesRes.statusCode).toEqual(200);
    expect(tablesRes.body.data.length).toBeGreaterThan(0);
    const testTable = tablesRes.body.data[0];

    // 2. Test Public Table Fetch (No Auth required for QR scanner)
    const publicTableRes = await request(app)
      .get(`/api/tables/public/${testTable.id}`);

    expect(publicTableRes.statusCode).toEqual(200);
    expect(publicTableRes.body.data.id).toEqual(testTable.id);

    // 3. Test Public Menu Items Fetch (No Auth required)
    const publicMenuItemsRes = await request(app)
      .get('/api/menu/public/items');

    expect(publicMenuItemsRes.statusCode).toEqual(200);
    expect(publicMenuItemsRes.body.data.length).toBeGreaterThan(0);
    const testMenuItem = publicMenuItemsRes.body.data[0];

    // 4. Test Public Customer Order Placement (No Auth required)
    const orderRes = await request(app)
      .post('/api/orders/public')
      .send({
        tableId: testTable.id,
        items: [
          { menuItemId: testMenuItem.id, quantity: 2 }
        ]
      });

    expect(orderRes.statusCode).toEqual(201);
    expect(orderRes.body.data).toHaveProperty('id');
    expect(orderRes.body.data.tableId).toEqual(testTable.id);
    const createdOrderId = orderRes.body.data.id;

    // 5. Verify Table status updated to OCCUPIED
    const occupiedTableRes = await request(app)
      .get(`/api/tables/public/${testTable.id}`);

    expect(occupiedTableRes.body.data.status).toEqual('OCCUPIED');

    // 6. Fetch Invoice PDF / HTML receipt for created order
    const invoicePdfRes = await request(app)
      .get(`/api/orders/${createdOrderId}/invoice-pdf`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(invoicePdfRes.statusCode).toEqual(200);
    expect(invoicePdfRes.body.data).toHaveProperty('html');
    expect(invoicePdfRes.body.data.orderId).toEqual(createdOrderId);
  });

  it('Table Management Full CRUD & Status Lifecycle Workflow', async () => {
    const testNum = `TEST-${Date.now().toString().slice(-4)}`;

    // 1. Create Table (POST /api/tables)
    const createRes = await request(app)
      .post('/api/tables')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tableNumber: testNum,
        capacity: 6,
        status: 'AVAILABLE'
      });

    expect(createRes.statusCode).toEqual(201);
    expect(createRes.body.data.tableNumber).toEqual(testNum);
    expect(createRes.body.data.capacity).toEqual(6);
    const tableId = createRes.body.data.id;

    // 2. Table Availability Stats (GET /api/tables/availability)
    const availRes = await request(app)
      .get('/api/tables/availability')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(availRes.statusCode).toEqual(200);
    expect(availRes.body.data).toHaveProperty('total');
    expect(availRes.body.data).toHaveProperty('available');

    // 3. Get Table By ID (GET /api/tables/:id)
    const getRes = await request(app)
      .get(`/api/tables/${tableId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body.data.id).toEqual(tableId);

    // 4. Update Table Capacity & Number (PUT /api/tables/:id)
    const updatedNum = `${testNum}-U`;
    const updateRes = await request(app)
      .put(`/api/tables/${tableId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tableNumber: updatedNum,
        capacity: 8
      });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.data.tableNumber).toEqual(updatedNum);
    expect(updateRes.body.data.capacity).toEqual(8);

    // 5. Change Table Status (PATCH /api/tables/:id/status)
    const statusRes = await request(app)
      .patch(`/api/tables/${tableId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'RESERVED' });

    expect(statusRes.statusCode).toEqual(200);
    expect(statusRes.body.data.status).toEqual('RESERVED');

    // 6. Delete Table (DELETE /api/tables/:id)
    const deleteRes = await request(app)
      .delete(`/api/tables/${tableId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toEqual(200);
  });
});


