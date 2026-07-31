const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('./middleware/error.middleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit.middleware');
const setupSwagger = require('./config/swagger');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const roleRoutes = require('./modules/role/role.routes');
const permissionRoutes = require('./modules/permission/permission.routes');
const staffRoutes = require('./modules/staff/staff.routes');
const userSessionRoutes = require('./modules/userSession/userSession.routes');
const customerRoutes = require('./modules/customer/customer.routes');
const tableRoutes = require('./modules/table/table.routes');
const menuRoutes = require('./modules/menu/menu.routes');
const ingredientRoutes = require('./modules/ingredient/ingredient.routes');
const recipeRoutes = require('./modules/recipe/recipe.routes');
const orderRoutes = require('./modules/order/order.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const supplierRoutes = require('./modules/supplier/supplier.routes');
const purchaseOrderRoutes = require('./modules/purchaseOrder/purchaseOrder.routes');
const supplierInvoiceRoutes = require('./modules/supplierInvoice/supplierInvoice.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const stockRoutes = require('./modules/stock/stock.routes');
const wasteRoutes = require('./modules/waste/waste.routes');
const expenseRoutes = require('./modules/expense/expense.routes');
const invoiceRoutes = require('./modules/invoice/invoice.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const activityLogRoutes = require('./modules/activityLog/activityLog.routes');
const auditLogRoutes = require('./modules/auditLog/auditLog.routes');
const fileUploadRoutes = require('./modules/fileUpload/fileUpload.routes');

const app = express();

// Hardened Security Headers via Helmet (with CSP disabled for Swagger UI compatibility)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'same-origin' }
  })
);

// Flexible CORS Configuration supporting Vercel, Render & Whitelisted Origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.trim().replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded invoice files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply General Rate Limiter to all API endpoints
app.use('/api', apiLimiter);

// Setup OpenAPI Swagger Documentation
setupSwagger(app);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'RestaurantOS Backend Running'
  });
});

// Authentication & Identity Routes (With Auth Rate Limiting)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/sessions', userSessionRoutes);

// Dining & Customer Routes
app.use('/api/customers', customerRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Supplier & Procurement Routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/supplier-invoices', supplierInvoiceRoutes);

// Inventory, Warehouse & Stock Balance Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/waste', wasteRoutes);

// Financial & Expense Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/invoices', invoiceRoutes);

// Files, OCR & System Log Routes
app.use('/api/files', fileUploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Dashboard & Analytics Routes
app.use('/api/dashboard', dashboardRoutes);

// AI Intelligence Services Routes
app.use('/api/ai', aiRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
