# API Documentation - Garment Production System

Base URL: `http://localhost:3000/api`

## Authentication

### Login
- **Endpoint**: `POST /auth/login`
- **Body**: 
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "token": "eyJhbG...",
    "user": { "id": 1, "username": "admin", "role": "ADMIN" }
  }
  ```

---

## Customers (Admin Only)

**Header required**: `Authorization: Bearer <token>`

### Get All Customers
- **Endpoint**: `GET /customers`
- **Query Params**: `?search=Nama` (optional)
- **Response**: `200 OK` (Array of customer objects)

### Create Customer
- **Endpoint**: `POST /customers`
- **Body**:
  ```json
  {
    "id": "CUST-004",
    "name": "PT. Sukses Selalu",
    "phone": "08111222333",
    "address": "Jl. Kemenangan"
  }
  ```
- **Response**: `201 Created`

### Update Customer
- **Endpoint**: `PUT /customers/:id`
- **Body**: (Partial customer object)
- **Response**: `200 OK`

### Delete Customer
- **Endpoint**: `DELETE /customers/:id`
- **Response**: `204 No Content`

---

## Products (Admin Only)

**Header required**: `Authorization: Bearer <token>`

### Get All Products
- **Endpoint**: `GET /products`
- **Query Params**: `?search=Kode` (optional)
- **Response**: `200 OK` (Array of product objects)

### Create Product
- **Endpoint**: `POST /products`
- **Body**:
  ```json
  {
    "id": "PROD-005",
    "code": "KMJ-002",
    "name": "Kemeja Lapangan",
    "type": "KEMEJA",
    "color": "Khaki",
    "size": "L"
  }
  ```
- **Response**: `201 Created`

### Update & Delete Product
- **Endpoints**: `PUT /products/:id` dan `DELETE /products/:id`

---

## Orders (Admin for Write, Admin/Production for Read)

**Header required**: `Authorization: Bearer <token>`

### Get All Orders
- **Endpoint**: `GET /orders`
- **Query Params**: `?status=CUTTING&search=ORD-001` (optional)
- **Response**: `200 OK`

### Create Order
- **Endpoint**: `POST /orders`
- **Body**:
  ```json
  {
    "orderNumber": "ORD-2023-004",
    "customerId": "CUST-001",
    "orderDate": "2023-10-01",
    "deadline": "2023-11-01",
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 100
      }
    ]
  }
  ```
- **Response**: `201 Created`

### Get Order Detail
- **Endpoint**: `GET /orders/:id`
- **Response**: `200 OK` (Includes order items, production progress, and reject records)

---

## Production

**Header required**: `Authorization: Bearer <token>`

### Get Running Orders (Admin & Production)
- **Endpoint**: `GET /production/running-orders`
- **Response**: `200 OK` (Array of orders where status != COMPLETE)

### Record Production Progress
- **Endpoint**: `POST /production/progress`
- **Body**:
  ```json
  {
    "orderItemId": 1,
    "quantity": 50,
    "stage": "SEWING"
  }
  ```
- **Response**: `201 Created`

### Record Quality Control (Reject)
- **Endpoint**: `POST /production/progress/qc`
- **Body**:
  ```json
  {
    "orderItemId": 1,
    "passedQuantity": 46,
    "rejectedQuantity": 4
  }
  ```
- **Response**: `200 OK`
- **Behavior**: Reduces QC quantity by 50, adds 46 to FINISHING, adds 4 back to SEWING as rejected items.

### Get Progress History
- **Endpoint**: `GET /production/progress/:orderItemId`
- **Response**: `200 OK` (Returns `progress`, `rejects`, and `summary` calculated data)

---

## Dashboard (Admin Only)

**Header required**: `Authorization: Bearer <token>`

### Get Dashboard Metrics
- **Endpoint**: `GET /dashboard/metrics`
- **Response**: `200 OK`
  ```json
  {
    "totalCustomers": 15,
    "totalOrders": 25,
    "runningOrders": 15,
    "completedOrders": 8,
    "delayedOrders": 2,
    "productionByStage": [
      { "stage": "CUTTING", "count": 500 },
      { "stage": "SEWING", "count": 450 }
    ]
  }
  ```
