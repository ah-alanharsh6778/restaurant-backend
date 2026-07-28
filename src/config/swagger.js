const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RestaurantOS Enterprise Full API Specification',
      version: '1.0.0',
      description: 'Comprehensive 36-Model 3NF REST API Documentation for RestaurantOS. Complete with explicit Request Bodies, Path & Query Parameters, and Response DTO Schemas for all 26 Modules & 70+ CRUD Endpoints.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Local Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // Standard Response & Error Schemas
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation Failed / Resource Not Found' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string', example: 'Field is required' },
                  param: { type: 'string', example: 'email' }
                }
              }
            }
          }
        },

        // 1. Auth DTO Schemas
        AuthLoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'harsh@gmail.com' },
            password: { type: 'string', example: 'Harsh@123' }
          }
        },
        AuthRegisterInput: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'roleId'],
          properties: {
            fullName: { type: 'string', example: 'Harsh Admin User' },
            email: { type: 'string', format: 'email', example: 'harsh@gmail.com' },
            password: { type: 'string', example: 'Harsh@123' },
            phone: { type: 'string', example: '+1-555-0199' },
            roleId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            staff: {
              type: 'object',
              properties: {
                employeeCode: { type: 'string', example: 'EMP-777' },
                department: { type: 'string', example: 'Executive' },
                designation: { type: 'string', example: 'Lead Administrator' },
                shift: { type: 'string', example: 'MORNING' },
                hireDate: { type: 'string', format: 'date', example: '2026-01-01' },
                salary: { type: 'number', example: 50000 }
              }
            }
          }
        },
        AuthRefreshInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },

        // 2. User & Staff DTO Schemas
        UserCreateInput: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'roleId'],
          properties: {
            fullName: { type: 'string', example: 'Alex Smith' },
            email: { type: 'string', format: 'email', example: 'alex.smith@restaurant.com' },
            password: { type: 'string', example: 'SecretPass@123' },
            phone: { type: 'string', example: '+15551234567' },
            roleId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' }
          }
        },
        UserUpdateInput: {
          type: 'object',
          properties: {
            fullName: { type: 'string', example: 'Alex Smith Updated' },
            phone: { type: 'string', example: '+15559876543' },
            isActive: { type: 'boolean', example: true },
            roleId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' }
          }
        },
        StaffCreateInput: {
          type: 'object',
          required: ['userId', 'employeeCode', 'department', 'designation', 'hireDate'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            employeeCode: { type: 'string', example: 'EMP-105' },
            department: { type: 'string', example: 'Kitchen' },
            designation: { type: 'string', example: 'Sous Chef' },
            shift: { type: 'string', example: 'MORNING' },
            hireDate: { type: 'string', format: 'date', example: '2026-03-15' },
            salary: { type: 'number', example: 38000 },
            emergencyContact: { type: 'string', example: '+1-555-9988' }
          }
        },
        StaffUpdateInput: {
          type: 'object',
          properties: {
            employeeCode: { type: 'string', example: 'EMP-105-B' },
            department: { type: 'string', example: 'Management' },
            designation: { type: 'string', example: 'Head Manager' },
            shift: { type: 'string', example: 'EVENING' },
            hireDate: { type: 'string', format: 'date', example: '2026-03-15' },
            salary: { type: 'number', example: 42000 },
            emergencyContact: { type: 'string', example: '+1-555-9988' }
          }
        },

        // 3. RBAC Roles & Permissions DTO Schemas
        RoleCreateInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'SUPERVISOR' },
            description: { type: 'string', example: 'Floor Shift Supervisor' }
          }
        },
        RoleUpdateInput: {
          type: 'object',
          properties: {
            description: { type: 'string', example: 'Updated Floor Shift Supervisor description' }
          }
        },
        PermissionCreateInput: {
          type: 'object',
          required: ['name', 'action', 'resource'],
          properties: {
            name: { type: 'string', example: 'orders:cancel' },
            action: { type: 'string', example: 'DELETE' },
            resource: { type: 'string', example: 'ORDERS' },
            description: { type: 'string', example: 'Permission to cancel active kitchen orders' }
          }
        },
        AssignPermissionInput: {
          type: 'object',
          required: ['roleId', 'permissionId'],
          properties: {
            roleId: { type: 'string', format: 'uuid' },
            permissionId: { type: 'string', format: 'uuid' }
          }
        },

        // 4. Customer DTO Schemas
        CustomerCreateInput: {
          type: 'object',
          required: ['fullName'],
          properties: {
            fullName: { type: 'string', example: 'Michael Corleone' },
            email: { type: 'string', format: 'email', example: 'michael@godfather.com' },
            phone: { type: 'string', example: '+1-555-0900' },
            loyaltyPoints: { type: 'integer', example: 150 }
          }
        },
        CustomerUpdateInput: {
          type: 'object',
          properties: {
            fullName: { type: 'string', example: 'Michael Corleone Jr.' },
            email: { type: 'string', format: 'email', example: 'michael.jr@godfather.com' },
            phone: { type: 'string', example: '+1-555-0901' },
            loyaltyPoints: { type: 'integer', example: 200 }
          }
        },

        // 5. Dining Table DTO Schemas
        TableCreateInput: {
          type: 'object',
          required: ['tableNumber', 'capacity'],
          properties: {
            tableNumber: { type: 'string', example: 'T-10' },
            capacity: { type: 'integer', example: 4 },
            status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'], default: 'AVAILABLE' }
          }
        },
        TableUpdateInput: {
          type: 'object',
          properties: {
            capacity: { type: 'integer', example: 6 },
            status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'], example: 'OCCUPIED' }
          }
        },

        // 6. Menu & Category DTO Schemas
        MenuCategoryInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Chef Specials' },
            description: { type: 'string', example: 'Signature gourmet dishes' }
          }
        },
        MenuCategoryUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Chef Specials Deluxe' },
            description: { type: 'string', example: 'Updated signature gourmet dishes' }
          }
        },
        MenuItemCreateInput: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: { type: 'string', example: 'Truffle Mushroom Risotto' },
            description: { type: 'string', example: 'Arborio rice cooked with wild mushrooms & truffle butter' },
            price: { type: 'number', example: 22.50 },
            isAvailable: { type: 'boolean', example: true },
            categoryId: { type: 'string', format: 'uuid' }
          }
        },
        MenuItemUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Truffle Mushroom Risotto Supreme' },
            description: { type: 'string', example: 'Updated description' },
            price: { type: 'number', example: 24.99 },
            isAvailable: { type: 'boolean', example: true },
            categoryId: { type: 'string', format: 'uuid' }
          }
        },

        // 7. Ingredient & Recipe DTO Schemas
        IngredientCreateInput: {
          type: 'object',
          required: ['name', 'unit'],
          properties: {
            name: { type: 'string', example: 'Arborio Rice' },
            unit: { type: 'string', enum: ['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACKET', 'PORTION'], example: 'KG' },
            quantity: { type: 'number', example: 50.0 },
            minimumStock: { type: 'number', example: 10.0 },
            costPerUnit: { type: 'number', example: 4.50 }
          }
        },
        IngredientUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Organic Arborio Rice' },
            quantity: { type: 'number', example: 75.0 },
            minimumStock: { type: 'number', example: 15.0 },
            costPerUnit: { type: 'number', example: 5.00 }
          }
        },
        RecipeCreateInput: {
          type: 'object',
          required: ['name', 'menuItemId'],
          properties: {
            name: { type: 'string', example: 'Risotto Recipe' },
            description: { type: 'string', example: 'Formulation for Truffle Mushroom Risotto' },
            menuItemId: { type: 'string', format: 'uuid' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                required: ['ingredientId', 'quantity', 'unit'],
                properties: {
                  ingredientId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'number', example: 0.15 },
                  unit: { type: 'string', example: 'KG' }
                }
              }
            }
          }
        },
        RecipeUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Updated Risotto Recipe' },
            description: { type: 'string', example: 'New formulation' }
          }
        },
        RecipeIngredientAddInput: {
          type: 'object',
          required: ['recipeId', 'ingredientId', 'quantity', 'unit'],
          properties: {
            recipeId: { type: 'string', format: 'uuid' },
            ingredientId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', example: 0.05 },
            unit: { type: 'string', example: 'KG' }
          }
        },

        // 8. Order & Payment DTO Schemas
        OrderCreateInput: {
          type: 'object',
          required: ['tableId', 'orderItems'],
          properties: {
            tableId: { type: 'string', format: 'uuid' },
            waiterId: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            orderItems: {
              type: 'array',
              items: {
                type: 'object',
                required: ['menuItemId', 'quantity'],
                properties: {
                  menuItemId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', example: 2 },
                  notes: { type: 'string', example: 'No onions' }
                }
              }
            }
          }
        },
        OrderUpdateInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'], example: 'PREPARING' }
          }
        },
        OrderItemAddInput: {
          type: 'object',
          required: ['orderId', 'menuItemId', 'quantity'],
          properties: {
            orderId: { type: 'string', format: 'uuid' },
            menuItemId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', example: 1 },
            notes: { type: 'string', example: 'Extra cheese' }
          }
        },
        PaymentProcessInput: {
          type: 'object',
          required: ['orderId', 'paymentMethod', 'amountPaid'],
          properties: {
            orderId: { type: 'string', format: 'uuid' },
            paymentMethod: { type: 'string', enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'DUE'], example: 'CREDIT_CARD' },
            amountPaid: { type: 'number', example: 45.0 }
          }
        },

        // 9. Supplier & Procurement DTO Schemas
        SupplierCreateInput: {
          type: 'object',
          required: ['name', 'contactPerson', 'phone', 'email', 'address'],
          properties: {
            name: { type: 'string', example: 'Global Organics Ltd.' },
            contactPerson: { type: 'string', example: 'David Miller' },
            phone: { type: 'string', example: '+1-555-3344' },
            email: { type: 'string', format: 'email', example: 'orders@globalorganics.com' },
            address: { type: 'string', example: '100 Harvest Way, Food Hub' },
            gstNumber: { type: 'string', example: 'GST99887766' }
          }
        },
        SupplierUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Global Organics International' },
            contactPerson: { type: 'string', example: 'David Miller Sr.' },
            phone: { type: 'string', example: '+1-555-3345' },
            email: { type: 'string', format: 'email', example: 'info@globalorganics.com' },
            address: { type: 'string', example: '200 Harvest Way' }
          }
        },
        PurchaseOrderCreateInput: {
          type: 'object',
          required: ['supplierId', 'items'],
          properties: {
            supplierId: { type: 'string', format: 'uuid' },
            expectedDelivery: { type: 'string', format: 'date', example: '2026-08-01' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['ingredientId', 'quantity', 'price'],
                properties: {
                  ingredientId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'number', example: 100 },
                  price: { type: 'number', example: 12.50 }
                }
              }
            }
          }
        },
        PurchaseOrderUpdateInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'], example: 'RECEIVED' }
          }
        },
        SupplierInvoiceCreateInput: {
          type: 'object',
          required: ['invoiceNumber', 'supplierId', 'invoiceDate', 'items'],
          properties: {
            invoiceNumber: { type: 'string', example: 'INV-2026-888' },
            supplierId: { type: 'string', format: 'uuid' },
            purchaseOrderId: { type: 'string', format: 'uuid' },
            invoiceDate: { type: 'string', format: 'date', example: '2026-07-25' },
            taxAmount: { type: 'number', example: 25.0 },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['description', 'quantity', 'unitPrice'],
                properties: {
                  description: { type: 'string', example: 'Organic Flour 25KG Bag' },
                  quantity: { type: 'number', example: 5 },
                  unitPrice: { type: 'number', example: 40.0 }
                }
              }
            }
          }
        },

        // 10. Multi-Warehouse & Inventory DTO Schemas
        ProductCategoryInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Soft Drinks & Sodas' },
            description: { type: 'string', example: 'Carbonated & bottled beverages' }
          }
        },
        ProductCreateInput: {
          type: 'object',
          required: ['name', 'sku', 'categoryId', 'unit', 'costPrice', 'sellingPrice'],
          properties: {
            name: { type: 'string', example: 'Cola Bottle 330ml' },
            sku: { type: 'string', example: 'SKU-COLA-330' },
            categoryId: { type: 'string', format: 'uuid' },
            unit: { type: 'string', example: 'PIECE' },
            currentStock: { type: 'number', example: 120 },
            minimumStock: { type: 'number', example: 24 },
            maximumStock: { type: 'number', example: 500 },
            costPrice: { type: 'number', example: 0.80 },
            sellingPrice: { type: 'number', example: 3.50 }
          }
        },
        ProductUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Cola Bottle 330ml Pack' },
            costPrice: { type: 'number', example: 0.85 },
            sellingPrice: { type: 'number', example: 3.99 },
            minimumStock: { type: 'number', example: 30 }
          }
        },
        WarehouseCreateInput: {
          type: 'object',
          required: ['name', 'location'],
          properties: {
            name: { type: 'string', example: 'East Annex Dry Storage' },
            location: { type: 'string', example: 'Building 2 Room 101' },
            manager: { type: 'string', example: 'Mark Stock Lead' }
          }
        },
        WarehouseUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'East Annex Main Dry Storage' },
            location: { type: 'string', example: 'Building 2 Room 102' },
            manager: { type: 'string', example: 'Mark Stock Controller' }
          }
        },
        StockTransactionInput: {
          type: 'object',
          required: ['warehouseId', 'quantity'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
            ingredientId: { type: 'string', format: 'uuid' },
            warehouseId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', example: 50.0 },
            remarks: { type: 'string', example: 'Routine stock movement' }
          }
        },
        StockAdjustInput: {
          type: 'object',
          required: ['warehouseId', 'newQuantity'],
          properties: {
            ingredientId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            warehouseId: { type: 'string', format: 'uuid' },
            newQuantity: { type: 'number', example: 85.0 },
            reason: { type: 'string', example: 'Physical audit count reconciliation' }
          }
        },
        FoodWasteInput: {
          type: 'object',
          required: ['ingredientId', 'quantity', 'unit', 'reason'],
          properties: {
            ingredientId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', example: 2.5 },
            unit: { type: 'string', enum: ['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACKET', 'PORTION'], example: 'KG' },
            reason: { type: 'string', enum: ['EXPIRED', 'SPOILED', 'COOKING_ERROR', 'CUSTOMER_RETURN', 'DAMAGE'], example: 'SPOILED' },
            remarks: { type: 'string', example: 'Overnight cooling malfunction' }
          }
        },

        // 11. Expense & Financial DTO Schemas
        ExpenseCategoryInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Maintenance & Repairs' },
            description: { type: 'string', example: 'Kitchen equipment repair & upkeep' }
          }
        },
        ExpenseCreateInput: {
          type: 'object',
          required: ['amount'],
          properties: {
            supplierId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            invoiceNumber: { type: 'string', example: 'INV-REP-900' },
            invoiceDate: { type: 'string', format: 'date', example: '2026-07-24' },
            amount: { type: 'number', example: 350.0 },
            tax: { type: 'number', example: 35.0 },
            total: { type: 'number', example: 385.0 },
            status: { type: 'string', enum: ['PENDING', 'PROCESSED', 'PAID', 'REJECTED'], example: 'PAID' },
            remarks: { type: 'string', example: 'Oven thermostat replacement' }
          }
        },
        ExpenseUpdateInput: {
          type: 'object',
          properties: {
            amount: { type: 'number', example: 400.0 },
            tax: { type: 'number', example: 40.0 },
            total: { type: 'number', example: 440.0 },
            status: { type: 'string', enum: ['PENDING', 'PROCESSED', 'PAID', 'REJECTED'], example: 'PROCESSED' },
            remarks: { type: 'string', example: 'Updated invoice remarks' }
          }
        },

        // 12. Notification DTO Schemas
        NotificationInput: {
          type: 'object',
          required: ['userId', 'title', 'message'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Critical Stock Warning' },
            message: { type: 'string', example: 'Butter stock levels reached minimum threshold (5KG remaining).' },
            type: { type: 'string', enum: ['INFO', 'WARNING', 'CRITICAL', 'ORDER_STATUS', 'LOW_STOCK'], example: 'CRITICAL' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {
      // 1. Health Check
      '/api/health': {
        get: {
          tags: ['1. System Health'],
          summary: 'Get backend service health status',
          responses: {
            200: { description: 'Running' }
          }
        }
      },

      // 2. Authentication
      '/api/auth/register': {
        post: {
          tags: ['2. Authentication'],
          summary: 'Register new user account with optional staff profile',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthRegisterInput' }
              }
            }
          },
          responses: {
            201: { description: 'User account created successfully' },
            400: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['2. Authentication'],
          summary: 'Login user & generate access + refresh JWT tokens',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthLoginInput' }
              }
            }
          },
          responses: {
            200: { description: 'Authentication successful. Returns tokens.' },
            401: { description: 'Invalid email or password' }
          }
        }
      },
      '/api/auth/refresh': {
        post: {
          tags: ['2. Authentication'],
          summary: 'Refresh JWT access token using valid refresh token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthRefreshInput' }
              }
            }
          },
          responses: {
            200: { description: 'New JWT access token generated' },
            401: { description: 'Invalid refresh token' }
          }
        }
      },

      // 3. Users & Staff
      '/api/users/profile': {
        get: {
          tags: ['3. Users & Staff'],
          summary: 'Get currently logged in user profile',
          responses: {
            200: { description: 'Current user profile returned' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/users': {
        get: {
          tags: ['3. Users & Staff'],
          summary: 'Get all users with search, filter, and pagination',
          parameters: [
            { name: 'page', in: 'query', description: 'Page number', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items per page', schema: { type: 'integer', default: 50 } },
            { name: 'search', in: 'query', description: 'Search term for name/email', schema: { type: 'string' } },
            { name: 'roleId', in: 'query', description: 'Filter by Role ID', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Paginated user list' } }
        },
        post: {
          tags: ['3. Users & Staff'],
          summary: 'Create a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserCreateInput' } }
            }
          },
          responses: { 201: { description: 'User created' } }
        }
      },
      '/api/users/{id}': {
        get: {
          tags: ['3. Users & Staff'],
          summary: 'Get user details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'User UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'User details' }, 404: { description: 'User not found' } }
        },
        put: {
          tags: ['3. Users & Staff'],
          summary: 'Update user account information',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'User UUID', schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserUpdateInput' } } }
          },
          responses: { 200: { description: 'User updated' } }
        },
        delete: {
          tags: ['3. Users & Staff'],
          summary: 'Soft-delete user account',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'User UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'User soft-deleted' } }
        }
      },
      '/api/staff': {
        get: {
          tags: ['3. Users & Staff'],
          summary: 'Get all staff profiles with pagination & filtering',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'department', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Staff profiles list' } }
        },
        post: {
          tags: ['3. Users & Staff'],
          summary: 'Create staff profile for an existing user',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StaffCreateInput' } } }
          },
          responses: { 201: { description: 'Staff profile created' } }
        }
      },
      '/api/staff/{id}': {
        get: {
          tags: ['3. Users & Staff'],
          summary: 'Get staff profile details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Staff Profile UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Staff details' } }
        },
        put: {
          tags: ['3. Users & Staff'],
          summary: 'Update staff profile details',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Staff Profile UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/StaffUpdateInput' } } } },
          responses: { 200: { description: 'Staff profile updated' } }
        },
        delete: {
          tags: ['3. Users & Staff'],
          summary: 'Delete staff profile',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Staff Profile UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Staff deleted' } }
        }
      },

      // 4. Roles & Permissions (RBAC)
      '/api/roles': {
        get: {
          tags: ['4. Roles & Permissions (RBAC)'],
          summary: 'Get all system roles and their permissions',
          responses: { 200: { description: 'Roles list' } }
        },
        post: {
          tags: ['4. Roles & Permissions (RBAC)'],
          summary: 'Create a new custom role',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RoleCreateInput' } } }
          },
          responses: { 201: { description: 'Role created' } }
        }
      },
      '/api/roles/{id}': {
        get: {
          tags: ['4. Roles & Permissions (RBAC)'],
          summary: 'Get role by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Role UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Role details' } }
        },
        put: {
          tags: ['4. Roles & Permissions (RBAC)'],
          summary: 'Update role description',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Role UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RoleUpdateInput' } } } },
          responses: { 200: { description: 'Role updated' } }
        },
        delete: {
          tags: ['4. Roles & Permissions (RBAC)'],
          summary: 'Delete role',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Role UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Role deleted' } }
        }
      },
      '/api/permissions': {
        get: {
          tags: ['4. Roles & Permissions (RBAC)'],
          summary: 'Get all permissions in system',
          responses: { 200: { description: 'Permissions list' } }
        },
        post: {
          tags: ['4. Roles & Permissions (RBAC)'],
          summary: 'Create a new permission entry',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PermissionCreateInput' } } }
          },
          responses: { 201: { description: 'Permission created' } }
        }
      },
      '/api/permissions/assign-role': {
        post: {
          tags: ['4. Roles & Permissions (RBAC)'],
          summary: 'Assign or grant permission to a role',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignPermissionInput' } } }
          },
          responses: { 200: { description: 'Permission assigned' } }
        }
      },

      // 5. User Sessions
      '/api/sessions': {
        get: {
          tags: ['5. User Sessions'],
          summary: 'Get all active user sessions',
          responses: { 200: { description: 'Active user sessions list' } }
        }
      },
      '/api/sessions/my-sessions': {
        get: {
          tags: ['5. User Sessions'],
          summary: 'Get active sessions for current user',
          responses: { 200: { description: 'User sessions list' } }
        }
      },
      '/api/sessions/revoke-all': {
        post: {
          tags: ['5. User Sessions'],
          summary: 'Revoke all sessions for current user (logout everywhere)',
          responses: { 200: { description: 'All active sessions revoked' } }
        }
      },
      '/api/sessions/{id}': {
        delete: {
          tags: ['5. User Sessions'],
          summary: 'Revoke a specific user session',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Session UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Session revoked' } }
        }
      },

      // 6. Customers
      '/api/customers': {
        get: {
          tags: ['6. Customers'],
          summary: 'Get all customers with search and pagination',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Customers list' } }
        },
        post: {
          tags: ['6. Customers'],
          summary: 'Create a new customer profile',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerCreateInput' } } }
          },
          responses: { 201: { description: 'Customer created' } }
        }
      },
      '/api/customers/{id}': {
        get: {
          tags: ['6. Customers'],
          summary: 'Get customer profile details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Customer UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Customer details' } }
        },
        put: {
          tags: ['6. Customers'],
          summary: 'Update customer profile',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Customer UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerUpdateInput' } } } },
          responses: { 200: { description: 'Customer updated' } }
        },
        delete: {
          tags: ['6. Customers'],
          summary: 'Delete customer profile',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Customer UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Customer deleted' } }
        }
      },

      // 7. Dining Tables
      '/api/tables': {
        get: {
          tags: ['7. Dining Tables'],
          summary: 'Get all restaurant dining tables',
          responses: { 200: { description: 'Tables list' } }
        },
        post: {
          tags: ['7. Dining Tables'],
          summary: 'Create a new dining table',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TableCreateInput' } } }
          },
          responses: { 201: { description: 'Table created' } }
        }
      },
      '/api/tables/{id}': {
        get: {
          tags: ['7. Dining Tables'],
          summary: 'Get dining table details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Table UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Table details' } }
        },
        put: {
          tags: ['7. Dining Tables'],
          summary: 'Update table status or seating capacity',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Table UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TableUpdateInput' } } } },
          responses: { 200: { description: 'Table updated' } }
        },
        delete: {
          tags: ['7. Dining Tables'],
          summary: 'Delete dining table',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Table UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Table deleted' } }
        }
      },

      // 8. Menu & Categories
      '/api/menu/categories': {
        get: {
          tags: ['8. Menu & Categories'],
          summary: 'Get all menu categories',
          responses: { 200: { description: 'Categories list' } }
        },
        post: {
          tags: ['8. Menu & Categories'],
          summary: 'Create menu category',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuCategoryInput' } } }
          },
          responses: { 201: { description: 'Category created' } }
        }
      },
      '/api/menu/categories/{id}': {
        put: {
          tags: ['8. Menu & Categories'],
          summary: 'Update menu category',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Category UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuCategoryUpdateInput' } } } },
          responses: { 200: { description: 'Category updated' } }
        },
        delete: {
          tags: ['8. Menu & Categories'],
          summary: 'Delete menu category',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Category UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Category deleted' } }
        }
      },
      '/api/menu': {
        get: {
          tags: ['8. Menu & Categories'],
          summary: 'Get all menu items with category filter and search',
          parameters: [
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Menu items list' } }
        },
        post: {
          tags: ['8. Menu & Categories'],
          summary: 'Create a new menu item',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuItemCreateInput' } } }
          },
          responses: { 201: { description: 'Menu item created' } }
        }
      },
      '/api/menu/{id}': {
        get: {
          tags: ['8. Menu & Categories'],
          summary: 'Get menu item details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Menu Item UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Menu item details' } }
        },
        put: {
          tags: ['8. Menu & Categories'],
          summary: 'Update menu item details or price',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Menu Item UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuItemUpdateInput' } } } },
          responses: { 200: { description: 'Menu item updated' } }
        },
        delete: {
          tags: ['8. Menu & Categories'],
          summary: 'Delete menu item',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Menu Item UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Menu item deleted' } }
        }
      },

      // 9. Recipes & Ingredients
      '/api/ingredients': {
        get: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Get all raw ingredients and stock levels',
          responses: { 200: { description: 'Ingredients list' } }
        },
        post: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Create raw ingredient master record',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/IngredientCreateInput' } } }
          },
          responses: { 201: { description: 'Ingredient created' } }
        }
      },
      '/api/ingredients/{id}': {
        get: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Get raw ingredient details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Ingredient UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Ingredient details' } }
        },
        put: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Update raw ingredient details',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Ingredient UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/IngredientUpdateInput' } } } },
          responses: { 200: { description: 'Ingredient updated' } }
        },
        delete: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Delete ingredient',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Ingredient UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Ingredient deleted' } }
        }
      },
      '/api/recipes': {
        get: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Get all dish recipes formulation',
          responses: { 200: { description: 'Recipes list' } }
        },
        post: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Create recipe formulation for a menu item',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RecipeCreateInput' } } }
          },
          responses: { 201: { description: 'Recipe created' } }
        }
      },
      '/api/recipes/{id}': {
        get: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Get recipe details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Recipe UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Recipe details' } }
        },
        put: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Update recipe formulation',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Recipe UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RecipeUpdateInput' } } } },
          responses: { 200: { description: 'Recipe updated' } }
        },
        delete: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Delete recipe',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Recipe UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Recipe deleted' } }
        }
      },
      '/api/recipes/ingredient': {
        post: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Add ingredient requirement to recipe',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RecipeIngredientAddInput' } } }
          },
          responses: { 201: { description: 'Ingredient added to recipe' } }
        }
      },
      '/api/recipes/ingredient/{id}': {
        delete: {
          tags: ['9. Recipes & Ingredients'],
          summary: 'Remove ingredient requirement from recipe',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'RecipeIngredient UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Ingredient removed from recipe' } }
        }
      },

      // 10. Order Management
      '/api/orders': {
        get: {
          tags: ['10. Order Management'],
          summary: 'Get all orders with filter by status, table, waiter, customer',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'tableId', in: 'query', schema: { type: 'string' } },
            { name: 'waiterId', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Orders list' } }
        },
        post: {
          tags: ['10. Order Management'],
          summary: 'Create dining order with automatic ingredient stock deduction',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderCreateInput' } } }
          },
          responses: { 201: { description: 'Order created' } }
        }
      },
      '/api/orders/{id}': {
        get: {
          tags: ['10. Order Management'],
          summary: 'Get order details with items and payments by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Order UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Order details' } }
        },
        put: {
          tags: ['10. Order Management'],
          summary: 'Update order status',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Order UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderUpdateInput' } } } },
          responses: { 200: { description: 'Order status updated' } }
        },
        delete: {
          tags: ['10. Order Management'],
          summary: 'Cancel dining order and revert ingredient stock deductions',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Order UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Order cancelled' } }
        }
      },
      '/api/orders/items': {
        post: {
          tags: ['10. Order Management'],
          summary: 'Add item to active order',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderItemAddInput' } } }
          },
          responses: { 201: { description: 'Item added to order' } }
        }
      },
      '/api/orders/items/{id}': {
        delete: {
          tags: ['10. Order Management'],
          summary: 'Remove item from order',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'OrderItem UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Item removed from order' } }
        }
      },

      // 11. Payment Settlement
      '/api/payments': {
        get: {
          tags: ['11. Payment Settlement'],
          summary: 'Get all processed payments',
          responses: { 200: { description: 'Payments list' } }
        },
        post: {
          tags: ['11. Payment Settlement'],
          summary: 'Process and settle payment for an order',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentProcessInput' } } }
          },
          responses: { 201: { description: 'Payment settled' } }
        }
      },
      '/api/payments/{id}': {
        get: {
          tags: ['11. Payment Settlement'],
          summary: 'Get payment record details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Payment UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Payment details' } }
        }
      },
      '/api/payments/order/{orderId}': {
        get: {
          tags: ['11. Payment Settlement'],
          summary: 'Get payment history for a specific order',
          parameters: [{ name: 'orderId', in: 'path', required: true, description: 'Order UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Payments for order' } }
        }
      },

      // 12. Suppliers & Procurement
      '/api/suppliers': {
        get: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Get all active suppliers',
          responses: { 200: { description: 'Suppliers list' } }
        },
        post: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Create a new supplier profile',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SupplierCreateInput' } } }
          },
          responses: { 201: { description: 'Supplier created' } }
        }
      },
      '/api/suppliers/{id}': {
        get: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Get supplier details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Supplier UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Supplier details' } }
        },
        put: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Update supplier profile',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Supplier UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SupplierUpdateInput' } } } },
          responses: { 200: { description: 'Supplier updated' } }
        },
        delete: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Delete supplier profile',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Supplier UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Supplier deleted' } }
        }
      },
      '/api/purchase-orders': {
        get: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Get all purchase orders',
          responses: { 200: { description: 'Purchase orders list' } }
        },
        post: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Create a new purchase order',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PurchaseOrderCreateInput' } } }
          },
          responses: { 201: { description: 'Purchase order created' } }
        }
      },
      '/api/purchase-orders/{id}': {
        get: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Get purchase order details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Purchase Order UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Purchase order details' } }
        },
        put: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Update purchase order status',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Purchase Order UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PurchaseOrderUpdateInput' } } } },
          responses: { 200: { description: 'Purchase order status updated' } }
        },
        delete: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Delete purchase order',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Purchase Order UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Purchase order deleted' } }
        }
      },
      '/api/supplier-invoices': {
        get: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Get all supplier invoices',
          responses: { 200: { description: 'Supplier invoices list' } }
        },
        post: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Create supplier invoice',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SupplierInvoiceCreateInput' } } }
          },
          responses: { 201: { description: 'Supplier invoice created' } }
        }
      },
      '/api/supplier-invoices/{id}': {
        get: {
          tags: ['12. Suppliers & Procurement'],
          summary: 'Get supplier invoice details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Supplier Invoice UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Supplier invoice details' } }
        }
      },

      // 13. Multi-Warehouse & Stock
      '/api/inventory/categories': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get product categories',
          responses: { 200: { description: 'Categories list' } }
        },
        post: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Create product category',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductCategoryInput' } } }
          },
          responses: { 201: { description: 'Category created' } }
        }
      },
      '/api/inventory/products': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get all inventory products',
          responses: { 200: { description: 'Products list' } }
        },
        post: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Create inventory product',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductCreateInput' } } }
          },
          responses: { 201: { description: 'Product created' } }
        }
      },
      '/api/inventory/products/{id}': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get product details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Product UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Product details' } }
        },
        put: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Update product details',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Product UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductUpdateInput' } } } },
          responses: { 200: { description: 'Product updated' } }
        },
        delete: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Delete product',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Product UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Product deleted' } }
        }
      },
      '/api/inventory/warehouses': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get all warehouse locations',
          responses: { 200: { description: 'Warehouses list' } }
        },
        post: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Create warehouse location',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WarehouseCreateInput' } } }
          },
          responses: { 201: { description: 'Warehouse created' } }
        }
      },
      '/api/inventory/warehouses/{id}': {
        put: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Update warehouse details',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Warehouse UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WarehouseUpdateInput' } } } },
          responses: { 200: { description: 'Warehouse updated' } }
        },
        delete: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Delete warehouse location',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Warehouse UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Warehouse deleted' } }
        }
      },
      '/api/inventory/stock-in': {
        post: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Record Stock-In transaction',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StockTransactionInput' } } }
          },
          responses: { 201: { description: 'Stock-in logged' } }
        }
      },
      '/api/inventory/stock-out': {
        post: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Record Stock-Out transaction',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StockTransactionInput' } } }
          },
          responses: { 201: { description: 'Stock-out logged' } }
        }
      },
      '/api/inventory/stock-history': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get stock transaction history',
          responses: { 200: { description: 'Transaction history list' } }
        }
      },
      '/api/stocks': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get stock balances across all warehouses',
          responses: { 200: { description: 'Stock balances list' } }
        }
      },
      '/api/stocks/adjust': {
        post: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Adjust warehouse stock balance',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StockAdjustInput' } } }
          },
          responses: { 200: { description: 'Stock adjusted' } }
        }
      },
      '/api/stocks/warehouse/{warehouseId}': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get stock balances for a specific warehouse',
          parameters: [{ name: 'warehouseId', in: 'path', required: true, description: 'Warehouse UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Stock list for warehouse' } }
        }
      },
      '/api/waste': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get food waste records',
          responses: { 200: { description: 'Waste logs list' } }
        },
        post: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Log food waste or spoilage',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodWasteInput' } } }
          },
          responses: { 201: { description: 'Food waste logged' } }
        }
      },
      '/api/waste/stats': {
        get: {
          tags: ['13. Multi-Warehouse & Stock'],
          summary: 'Get food waste loss statistics',
          responses: { 200: { description: 'Waste metrics summary' } }
        }
      },

      // 14. Expenses & Financials
      '/api/expenses/categories': {
        get: {
          tags: ['14. Expenses & Financials'],
          summary: 'Get expense categories',
          responses: { 200: { description: 'Expense categories list' } }
        },
        post: {
          tags: ['14. Expenses & Financials'],
          summary: 'Create expense category',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseCategoryInput' } } }
          },
          responses: { 201: { description: 'Expense category created' } }
        }
      },
      '/api/expenses/categories/{id}': {
        put: {
          tags: ['14. Expenses & Financials'],
          summary: 'Update expense category',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Category UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseCategoryInput' } } } },
          responses: { 200: { description: 'Expense category updated' } }
        },
        delete: {
          tags: ['14. Expenses & Financials'],
          summary: 'Delete expense category',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Category UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Expense category deleted' } }
        }
      },
      '/api/expenses/upload': {
        post: {
          tags: ['14. Expenses & Financials'],
          summary: 'Upload invoice attachments for expenses',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    invoices: {
                      type: 'array',
                      items: { type: 'string', format: 'binary' }
                    }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Files uploaded' } }
        }
      },
      '/api/expenses/export': {
        get: {
          tags: ['14. Expenses & Financials'],
          summary: 'Export expense register as Excel file (.xlsx)',
          responses: { 200: { description: 'Excel spreadsheet binary' } }
        }
      },
      '/api/expenses': {
        get: {
          tags: ['14. Expenses & Financials'],
          summary: 'Get all operational expenses',
          responses: { 200: { description: 'Expenses list' } }
        },
        post: {
          tags: ['14. Expenses & Financials'],
          summary: 'Create operational expense',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseCreateInput' } } }
          },
          responses: { 201: { description: 'Expense created' } }
        }
      },
      '/api/expenses/{id}': {
        get: {
          tags: ['14. Expenses & Financials'],
          summary: 'Get expense details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Expense UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Expense details' } }
        },
        put: {
          tags: ['14. Expenses & Financials'],
          summary: 'Update expense record',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Expense UUID', schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseUpdateInput' } } } },
          responses: { 200: { description: 'Expense updated' } }
        },
        delete: {
          tags: ['14. Expenses & Financials'],
          summary: 'Delete expense record',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Expense UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Expense deleted' } }
        }
      },

      // 14.5. AI Invoice Processing
      '/api/invoices/upload': {
        post: {
          tags: ['14.5. AI Invoice Processing'],
          summary: 'Upload Invoice PDF, PNG, JPG, or JPEG file',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'Invoice attachment (PDF/PNG/JPG/JPEG, max 10MB)' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Invoice file uploaded and saved with UPLOADED status' },
            400: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      '/api/invoices/{id}/process': {
        post: {
          tags: ['14.5. AI Invoice Processing'],
          summary: 'Run OCR & AI Parsing to extract JSON, save items, and auto-create Expense',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Invoice UUID', schema: { type: 'string' } }],
          responses: {
            200: { description: 'Invoice processed, items stored, and Expense automatically created' },
            404: { description: 'Invoice not found' }
          }
        }
      },
      '/api/invoices/{id}/reprocess': {
        post: {
          tags: ['14.5. AI Invoice Processing'],
          summary: 'Re-run OCR and AI Parsing for an existing invoice',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Invoice UUID', schema: { type: 'string' } }],
          responses: {
            200: { description: 'Invoice reprocessed successfully' }
          }
        }
      },
      '/api/invoices': {
        get: {
          tags: ['14.5. AI Invoice Processing'],
          summary: 'Get all processed & uploaded invoices with search and status filters',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Invoices list' } }
        }
      },
      '/api/invoices/{id}': {
        get: {
          tags: ['14.5. AI Invoice Processing'],
          summary: 'Get detailed invoice with items & linked Expense entry by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Invoice UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Invoice details' } }
        },
        delete: {
          tags: ['14.5. AI Invoice Processing'],
          summary: 'Delete invoice record and associated items',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Invoice UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Invoice deleted' } }
        }
      },

      // 15. File Uploads & OCR
      '/api/files/upload-ocr': {
        post: {
          tags: ['15. File Uploads & OCR'],
          summary: 'Upload invoice PDF/image and extract JSON via AI OCR',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'File processed and OCR data extracted' } }
        }
      },
      '/api/files': {
        get: {
          tags: ['15. File Uploads & OCR'],
          summary: 'Get all uploaded files & OCR records',
          responses: { 200: { description: 'Files list' } }
        }
      },
      '/api/files/{id}': {
        get: {
          tags: ['15. File Uploads & OCR'],
          summary: 'Get file record & OCR JSON by ID',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'File UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'File & OCR details' } }
        }
      },

      // 16. Dashboard Analytics
      '/api/dashboard/sales-overview': {
        get: {
          tags: ['16. Dashboard Analytics'],
          summary: 'Get sales overview metrics',
          responses: { 200: { description: 'Sales summary metrics' } }
        }
      },
      '/api/dashboard/profit': {
        get: {
          tags: ['16. Dashboard Analytics'],
          summary: 'Get net profit financial metrics',
          responses: { 200: { description: 'Net profit calculation' } }
        }
      },
      '/api/dashboard/table-occupancy': {
        get: {
          tags: ['16. Dashboard Analytics'],
          summary: 'Get table occupancy percentage',
          responses: { 200: { description: 'Occupancy metrics' } }
        }
      },
      '/api/dashboard/low-stock': {
        get: {
          tags: ['16. Dashboard Analytics'],
          summary: 'Get low stock inventory alerts',
          responses: { 200: { description: 'Low stock items' } }
        }
      },
      '/api/dashboard/top-selling-menu': {
        get: {
          tags: ['16. Dashboard Analytics'],
          summary: 'Get top 10 best-selling menu items',
          responses: { 200: { description: 'Top menu items' } }
        }
      },

      // 17. AI Intelligence Microservice
      '/api/ai/predict-stock': {
        get: {
          tags: ['17. AI Intelligence Microservice'],
          summary: 'Get stock shortage consumption predictions',
          responses: { 200: { description: 'Stock predictions' } }
        }
      },
      '/api/ai/menu-pricing': {
        get: {
          tags: ['17. AI Intelligence Microservice'],
          summary: 'Get AI menu pricing optimization recommendations',
          responses: { 200: { description: 'Pricing recommendations' } }
        }
      },
      '/api/ai/food-waste': {
        get: {
          tags: ['17. AI Intelligence Microservice'],
          summary: 'Get food waste risk analysis',
          responses: { 200: { description: 'Food waste risk metrics' } }
        }
      },
      '/api/ai/prep-time': {
        get: {
          tags: ['17. AI Intelligence Microservice'],
          summary: 'Get estimated kitchen preparation time',
          parameters: [{ name: 'orderId', in: 'query', description: 'Order UUID (optional)', schema: { type: 'string' } }],
          responses: { 200: { description: 'Prep time estimation' } }
        }
      },

      // 18. System Audit & Notifications
      '/api/notifications': {
        get: {
          tags: ['18. System Audit & Notifications'],
          summary: 'Get all system notifications',
          responses: { 200: { description: 'Notifications list' } }
        },
        post: {
          tags: ['18. System Audit & Notifications'],
          summary: 'Create a system notification',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationInput' } } }
          },
          responses: { 201: { description: 'Notification created' } }
        }
      },
      '/api/notifications/my-notifications': {
        get: {
          tags: ['18. System Audit & Notifications'],
          summary: 'Get notifications for logged in user',
          responses: { 200: { description: 'User notifications' } }
        }
      },
      '/api/notifications/{id}/read': {
        put: {
          tags: ['18. System Audit & Notifications'],
          summary: 'Mark notification as read',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Notification UUID', schema: { type: 'string' } }],
          responses: { 200: { description: 'Notification marked as read' } }
        }
      },
      '/api/notifications/read-all': {
        put: {
          tags: ['18. System Audit & Notifications'],
          summary: 'Mark all user notifications as read',
          responses: { 200: { description: 'All notifications marked as read' } }
        }
      },
      '/api/activity-logs': {
        get: {
          tags: ['18. System Audit & Notifications'],
          summary: 'Get user security activity logs',
          responses: { 200: { description: 'Activity logs' } }
        }
      },
      '/api/audit-logs': {
        get: {
          tags: ['18. System Audit & Notifications'],
          summary: 'Get entity database mutation audit logs',
          responses: { 200: { description: 'Audit logs' } }
        }
      }
    }
  },
  apis: ['./src/modules/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📖 Swagger UI Documentation active at: http://localhost:5000/api/docs');
};

module.exports = setupSwagger;
