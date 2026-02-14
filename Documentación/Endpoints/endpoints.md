# 👉 **AUTH SERVICE**

## 📌 **ENDPOINTS DE REGISTRO**

### 1. **Crear usuario** (Solo CLIENTE)

En este endpoint solo se pueden registrar usarios de tipo cliente.
```
POST http://localhost:4000/auth/register/client
Content-Type: application/json
```

### **Json a enviar:**
```json
{
  "email": "lisbeth@gmail.com",
  "password": "201504070",
  "role": "CliENTE"
}
```
### **Respuesta exitosa:**
```json
{
  "id": "53c0ad5a-311b-474d-953c-b6b5376218a9",
  "email": "lisbeth@gmail.com",
  "role": "CLIENTE"
}
```
### **Respuesta con errores:**

```json
{
  "statusCode": 500,
  "message": "Email ya existe"
}
```
---
### 2. **Crear usuario** (Solo ADMINISTRADOR)

En este endpoint solo un administrador puede registrar usuarios de tipo repartidor y restaurante.

```
POST http://localhost:4000/auth/register/admin
Authorization: Bearer <token_admin>
Content-Type: application/json
```

### **Json a enviar:**
```json
{
  "email": "marta@gmail.com",
  "password": "201504070",
  "role": "REPARTIDOR | RESTAURANTE"
}
```
### **Respuesta exitosa:**
```json
{
  "id": "b49929cc-9db8-463a-81be-15d95713eb68",
  "email": "restaurante1@gmail.com",
  "role": "RESTAURANTE"
}
```
### **Respuesta con errores:***

```json
{
  "statusCode": 500,
  "message": "Email ya existe"
}
```
---
### 3. **Crear Administrador** (Solo ADMINISTRADOR)

En este endpoint solo un usuario administrador puede registrar a otro usuario administrador.

```
POST http://localhost:4000/auth/register/admin
Authorization: Bearer <token_admin>
Content-Type: application/json
```

### **Json a enviar:**
```json
{
  "email": "administrador2@admin.com",
  "password": "201504070",
  "role": "ADMINISTRADOR"
}
```
### **Respuesta exitosa:**
```json
{
  "id": "d55d6ea8-20aa-4e07-a32a-b8499baf1a1b",
  "email": "administrador2@admin.com",
  "role": "ADMINISTRADOR"
}
```
### **Respuesta con errores:**

```json
{
  "statusCode": 500,
  "message": "Email ya existe"
}
```
---

## 📌 **ENDPOINTS DE LOGIN**

### 1. **Login** (todos los USUARIOS)

```
POST http://localhost:4000/auth/login/
Content-Type: application/json
```

### **Json a enviar:**

```json
{
  "email":"admin@admin.com",
  "password":"201504070"
}
```
### **Respuesta exitosa:**

Aqui se regresa un token, el cual lleva en el payload el role del usuario y el id.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNmU5MDNhYi04NTcwLTRiODktODE0ZC00NjM3N2ZiMjQ3Y2YiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJBRE1JTklTVFJBRE9SIiwiaWF0IjoxNzcwOTcxNDgyLCJleHAiOjE3NzA5NzIzODJ9.Dd7wg4fkGXiQeToLQqANf2Knu9uxnXU0QX8n_m_wgFQ",
  "refreshToken": "fb9af508973fc3e419ca92bc72bbaedbdbd9abef3b767fd4f94ed4e4c82e7180c766a92457eaf116d9f1a559b75dd2bfb4932ae72d893d0b7d3815cd73428df8"
}
```
### **Respuesta con errores:**

```json
{
  "statusCode": 500,
  "message": "Credenciales inválidas"
}
```

### 2. **Logout** (todos los USUARIOS)

```
POST http://localhost:4000/auth/logout/
Content-Type: application/json
```

### **Json a enviar:**

```json
{
  "refreshToken":"0c52c7affc589a877832aa10578f6ae3070d2fa32d806168ab2679110ec1562c443f508510fe8856c17b06333816125c40d662414697649bc7aeca7ea7529c97"
}
```
### **Respuesta exitosa:**

```json
{}
```
### **Respuesta con errores:**

```json
{
  "statusCode": 500,
  "message": "Refresh token inválido o expirado"
}
```
---

### 3. **Actualizar refresh token**

```
POST http://localhost:4000/auth/refresh
Content-Type: application/json
```

### **Json a enviar:**

```json
{
  "refreshToken":"24ec95214233639a0699262f8aeeb88b0c495f0e4aa2f83857b5a333aa1f27de5cb5b932ce6949ba2b2c02fc30f11538e6d7c0f07c6b1f01f7f8868c19f6e579"
}
```
### **Respuesta exitosa:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNmU5MDNhYi04NTcwLTRiODktODE0ZC00NjM3N2ZiMjQ3Y2YiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJBRE1JTklTVFJBRE9SIiwiaWF0IjoxNzcwOTc0MTIwLCJleHAiOjE3NzA5NzUwMjB9.3-pXSsDmpuR49A4xQWDdGutsCVIks9-Dc3o0ts-rBA8",
  "refreshToken": "7733a838b7504b7f6657d8a38c22035111b8c76bc2265d33d4c27a6a92f7df2f353886605b6744dc4b501c66e74703a3a728c9043bfc29a94714987ddd36285e"
}
```
### **Respuesta con errores:**

```json
{
  "statusCode": 500,
  "message": "Refresh token inválido o expirado"
}
```
---

# 👉 **RESTAURANT SERVICE**

## 📌 **ENDPOINTS DE RESTAURANT**

### 1. **Crear Restaurante** (Solo ADMINISTRADOR)
```
POST http://localhost:4000/restaurants
Authorization: Bearer <token_admin>
Content-Type: application/json
```
### **Json a enviar:**
```json
{
  "name": "El Rincón de Sabor",
  "description": "Comida típica guatemalteca",
  "address": "6a Avenida 12-34, Zona 1, Guatemala, 01001",
  "phone": "2233-4455",
  "opening_time": "08:00",
  "closing_time": "22:00"
}
```
### **Respuesta exitosa:**
```json
{
  "id": "3588618e-f740-4732-9f41-58b8104f1a0e",
  "owner_id": "d55d6ea8-20aa-4e07-a32a-b8499baf1a1b",
  "name": "El Rincón de Sabor",
  "description": "Comida típica guatemalteca",
  "address": "6a Avenida 12-34, Zona 1, Guatemala, 01001",
  "phone": "2233-4455",
  "opening_time": "08:00",
  "closing_time": "22:00",
  "is_active": true,
  "created_at": "2026-02-13T09:20:49.000Z",
  "updated_at": "2026-02-13T09:20:49.000Z"
}
```

### **Respuesta con errores:**
```json
{
  "message": "Expected double-quoted property name in JSON at position 197 (line 7 column 1)",
  "error": "Bad Request",
  "statusCode": 400
}
```
---

### 2. **Actualizar Restaurante** (Solo ADMINISTRADOR)
```
PUT http://localhost:4000/restaurants/:id_restaurant
Authorization: Bearer <token_admin>
Content-Type: application/json
```
### **Json a enviar:**

```json
{
  "name": "La Cocina de la Tía",
  "description": "Comida típica guatemalteca - Nuevo local",
  "address": "Boulevard Los Próceres 20-30, Zona 10, Guatemala, 01010",
  "phone": "2233-5566",
  "opening_time": "09:00",
  "closing_time": "23:00",
  "is_active": true
}
```

### **Respuesta exitosa:**
```json
{
  "id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "owner_id": "d55d6ea8-20aa-4e07-a32a-b8499baf1a1b",
  "name": "La Cocina de la Tía",
  "description": "Comida típica guatemalteca - Nuevo local",
  "address": "Boulevard Los Próceres 20-30, Zona 10, Guatemala, 01010",
  "phone": "2233-5566",
  "opening_time": "09:00",
  "closing_time": "23:00",
  "is_active": true,
  "created_at": "2026-02-13T09:23:59.000Z",
  "updated_at": "2026-02-13T09:38:54.000Z"
}
```

### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Restaurante con id 8209e1cf-f337-4f0c-92c3-45aa753513c no encontrado"
}
```
---

### 3. **Eliminar Restaurante** (Solo ADMINISTRADOR)

Un administrador solo puede eliminar restaurantes que el ha creado, no puede eliminar los de otros.
```
DELETE http://localhost:4000/restaurants/:id_restaurant
Authorization: Bearer <token_admin>
```
### **Respuesta exitosa:**
```json
{}
```

### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Restaurante con id 8209e1cf-f337-4f0c-92c3-45aa753513c no encontrado"
}
```

---

### 4. **Obtener Restaurante por ID** (Público)
```
GET http://localhost:4000/restaurants/:id_restaurant
```
### **Respuesta exitosa:**
```json
{
  "id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "owner_id": "d55d6ea8-20aa-4e07-a32a-b8499baf1a1b",
  "name": "La Cocina de la Tía",
  "description": "Comida típica guatemalteca - Nuevo local",
  "address": "Boulevard Los Próceres 20-30, Zona 10, Guatemala, 01010",
  "phone": "2233-5566",
  "opening_time": "09:00",
  "closing_time": "23:00",
  "is_active": true,
  "created_at": "2026-02-13T09:23:59.000Z",
  "updated_at": "2026-02-13T09:38:54.000Z"
}
```

### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Restaurante con id 8209e1cf-f337-4f0c-92c3-45aa753513c no encontrado"
}
```

---

### 5. **Listar Restaurantes** (Público)
```
GET http://localhost:4000/restaurants?page=1&limit=10&onlyActive=true&search=abuela
```

| Query | Descripción | Ejemplo |
|-------|-------------|---------|
| `page` | Número de página | `1` |
| `limit` | Resultados por página | `10` |
| `onlyActive` | Solo restaurantes activos | `true` |
| `search` | Búsqueda por nombre | `abuela` |

### **Respuesta exitosa:**
```json
{
  "restaurants": [
    {
      "id": "2027f4bb-4cc8-4b09-964e-76ff3392a4a2",
      "owner_id": "06e903ab-8570-4b89-814d-46377fb247cf",
      "name": "La Casa de la Abuela",
      "description": "Comida típica guatemalteca",
      "address": "6a Avenida 12-34, Zona 1, Guatemala, 01001",
      "phone": "2233-4455",
      "opening_time": "08:00",
      "closing_time": "22:00",
      "is_active": true,
      "created_at": "2026-02-12T10:33:23.000Z",
      "updated_at": "2026-02-12T10:33:23.000Z"
    },
    {
      "id": "8ac282d3-8921-4325-b18f-86483313f165",
      "owner_id": "06e903ab-8570-4b89-814d-46377fb247cf",
      "name": "La Casa de la Abuela",
      "description": "Comida típica guatemalteca",
      "address": "6a Avenida 12-34, Zona 1, Guatemala, 01001",
      "phone": "2233-4455",
      "opening_time": "08:00",
      "closing_time": "22:00",
      "is_active": true,
      "created_at": "2026-02-12T10:31:15.000Z",
      "updated_at": "2026-02-13T09:41:26.000Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10
}
```

### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Internal server error: Validation failed: page must not be less than 1"
}
```

---

## 📌 **ENDPOINTS DE MENÚ**

### 6. **Crear Item de Menú** (RESTAURANTE/ADMINISTRADOR)
```
POST http://localhost:4000/restaurants/:id_restaurant/menu-items
Authorization: Bearer <token_restaurante_o_admin>
Content-Type: application/json
```
### **Json a enviar:**

```json
{
  "name": "Pepián de Pollo",
  "description": "Delicioso pepián con pollo, arroz y verduras",
  "price": 85.50,
  "image_url": "https://ejemplo.com/pepian.jpg",
  "is_available": true
}
```

### **Respuesta exitosa:**
```json
{
  "id": "72f3aca0-b5ff-4db3-b4f6-7d1fdd21b3f3",
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "name": "Pepián de Pollo",
  "description": "Delicioso pepián con pollo, arroz y verduras",
  "price": 85.5,
  "image_url": "https://ejemplo.com/pepian.jpg",
  "is_available": true,
  "created_at": "2026-02-13T09:58:32.000Z",
  "updated_at": "2026-02-13T09:58:32.000Z"
}
```

### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Restaurante con id 8209e1cf-f337-4f0c-92c3-45aa753513c no encontrado"
}
```

---

### 7. **Actualizar Item de Menú** (RESTAURANTE/ADMINISTRADOR)
```
PUT http://localhost:4000/restaurants/:restaurantId/menu-items/:id
Authorization: Bearer <token_restaurante_o_admin>
Content-Type: application/json
```

### **Json a enviar:**
```json
{
  "name": "Pepián de Pollo Especial 2",
  "description": "Pepián con pollo, arroz, verduras y huevo duro",
  "price": 95.00,
  "image_url": "https://ejemplo.com/pepian-especial.jpg",
  "is_available": true,
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb"
}
```

### **Respuesta exitosa:**
```json
{
  "id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "name": "Pepián de Pollo Especial 2",
  "description": "Pepián con pollo, arroz, verduras y huevo duro",
  "price": 95,
  "image_url": "https://ejemplo.com/pepian-especial.jpg",
  "is_available": true,
  "created_at": "2026-02-13T10:02:51.000Z",
  "updated_at": "2026-02-13T10:05:39.000Z"
}
```

### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Menu item con id fec28fce-0a5a-4739-87e7-b5d98e7ada4 no encontrado"
}

```
---

### 8. **Eliminar Item de Menú** (RESTAURANTE/ADMINISTRADOR)
```
DELETE http://localhost:4000/restaurants/menu-items/:id_menu
Authorization: Bearer <token_restaurante_o_admin>
Content-Type: application/json
```

### **Json a enviar:**
```json
{
  "restaurantId": "8209e1cf-f337-4f0c-92c3-45aa753513cb"
}
```

### **Respuesta exitosa:**
```json
{}
```

### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Menu item con id 72f3aca0-b5ff-4db3-b4f6-7d1fdd21b3f3 no encontrado"
}
```

---

### 9. **Obtener Menú del Restaurante** (Público)
```
GET http://localhost:4000/restaurants/:id_restaurant/menu
```

### **Respuesta exitosa:**
```json
{
  "items": [
    {
      "id": "ff69fca5-2480-4010-b51a-5e99e2bb604b",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "name": "Arroz de Pollo",
      "description": "Delicioso pepián con pollo, arroz y verduras",
      "price": 85.5,
      "image_url": "https://ejemplo.com/pepian.jpg",
      "is_available": true,
      "created_at": "2026-02-13T10:02:18.000Z",
      "updated_at": "2026-02-13T10:02:18.000Z"
    },
    {
      "id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "name": "Caldo de rez",
      "description": "Delicioso pepián con pollo, arroz y verduras",
      "price": 85.5,
      "image_url": "https://ejemplo.com/pepian.jpg",
      "is_available": true,
      "created_at": "2026-02-13T10:02:28.000Z",
      "updated_at": "2026-02-13T10:02:28.000Z"
    },
    {
      "id": "1b257198-657c-444b-84c5-164c4e16b464",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "name": "Carne asada",
      "description": "Delicioso pepián con pollo, arroz y verduras",
      "price": 85.5,
      "image_url": "https://ejemplo.com/pepian.jpg",
      "is_available": true,
      "created_at": "2026-02-13T10:02:37.000Z",
      "updated_at": "2026-02-13T10:02:37.000Z"
    },
    {
      "id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "name": "Pepián de Pollo Especial 2",
      "description": "Pepián con pollo, arroz, verduras y huevo duro",
      "price": 95,
      "image_url": "https://ejemplo.com/pepian-especial.jpg",
      "is_available": true,
      "created_at": "2026-02-13T10:02:51.000Z",
      "updated_at": "2026-02-13T10:05:39.000Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 10
}
```

### **Respuesta con errores:**
```json
{
  "message": "Cannot GET /restaurants/8209e1cf-f337-4f0c-92c3-45aa753513/men",
  "error": "Not Found",
  "statusCode": 404
}
```
---

### 10. **Listar Items de Menú** (Público)
```
GET http://localhost:4000/restaurants/:id_restaurant/menu-items?onlyAvailable=true&page=1&limit=20
```

| Query | Descripción | Ejemplo |
|-------|-------------|---------|
| `onlyAvailable` | Solo items disponibles | `true` |
| `page` | Número de página | `1` |
| `limit` | Resultados por página | `20` |

### **Respuesta exitosa:**
```json
{
  "items": [
    {
      "id": "ff69fca5-2480-4010-b51a-5e99e2bb604b",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "name": "Arroz de Pollo",
      "description": "Delicioso pepián con pollo, arroz y verduras",
      "price": 85.5,
      "image_url": "https://ejemplo.com/pepian.jpg",
      "is_available": true,
      "created_at": "2026-02-13T10:02:18.000Z",
      "updated_at": "2026-02-13T10:02:18.000Z"
    },
    {
      "id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "name": "Caldo de rez",
      "description": "Delicioso pepián con pollo, arroz y verduras",
      "price": 85.5,
      "image_url": "https://ejemplo.com/pepian.jpg",
      "is_available": true,
      "created_at": "2026-02-13T10:02:28.000Z",
      "updated_at": "2026-02-13T10:02:28.000Z"
    },
    {
      "id": "1b257198-657c-444b-84c5-164c4e16b464",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "name": "Carne asada",
      "description": "Delicioso pepián con pollo, arroz y verduras",
      "price": 85.5,
      "image_url": "https://ejemplo.com/pepian.jpg",
      "is_available": true,
      "created_at": "2026-02-13T10:02:37.000Z",
      "updated_at": "2026-02-13T10:02:37.000Z"
    },
    {
      "id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "name": "Pepián de Pollo Especial 2",
      "description": "Pepián con pollo, arroz, verduras y huevo duro",
      "price": 95,
      "image_url": "https://ejemplo.com/pepian-especial.jpg",
      "is_available": true,
      "created_at": "2026-02-13T10:02:51.000Z",
      "updated_at": "2026-02-13T10:05:39.000Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 20
}
```

### **Respuesta con errores:**
```json
{
  "message": "Cannot GET /restaurantsaa753513cb/menu-items?onlyAvailable=true&page=1&limit=20",
  "error": "Not Found",
  "statusCode": 404
}
```
---

## 📌 **ENDPOINT DE VALIDACIÓN PARA ORDER-SERVICE**

Este endpoint NO es llamado directamente desde el frontend, sino desde el **Order-Service** vía gRPC:

```protobuf
rpc ValidateOrderItems (ValidateOrderItemsRequest) returns (ValidateOrderItemsResponse);
```

**Ejemplo de llamada gRPC interna:**

### **Json a enviar:**
```json
{
  "restaurant_id": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "menu_item_id": "123e4567-e89b-12d3-a456-426614174000",
      "quantity": 2,
      "price": 85.50
    },
    {
      "menu_item_id": "987fcdeb-51a2-43d7-9b56-426614174111",
      "quantity": 1,
      "price": 45.00
    }
  ]
}
```

**Respuesta exitosa:**
```json
{
  "valid": true,
  "errors": [],
  "validated_items": [
    {
      "menu_item_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Pepián de Pollo",
      "current_price": 85.50,
      "is_available": true,
      "requested_quantity": 2,
      "subtotal": 171.00
    },
    {
      "menu_item_id": "987fcdeb-51a2-43d7-9b56-426614174111",
      "name": "Jugo de Naranja",
      "current_price": 45.00,
      "is_available": true,
      "requested_quantity": 1,
      "subtotal": 45.00
    }
  ],
  "total_amount": 216.00
}
```

**Respuesta con errores:***
```json
{
  "valid": false,
  "errors": [
    {
      "code": "PRICE_MISMATCH",
      "message": "El precio del producto 'Pepián de Pollo' ha cambiado. Precio actual: $90.00",
      "menu_item_id": "123e4567-e89b-12d3-a456-426614174000"
    },
    {
      "code": "ITEM_NOT_AVAILABLE",
      "message": "El producto 'Jugo de Naranja' no está disponible actualmente",
      "menu_item_id": "987fcdeb-51a2-43d7-9b56-426614174111"
    }
  ],
  "validated_items": [],
  "total_amount": 0
}
```

---

## 📌 **FLUJO COMPLETO PARA PRUEBAS**

### **Paso 1: Login como ADMINISTRADOR**
```
POST http://localhost:4000/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@admin.com",
  "password": "201504070"
}
```

**Respuesta exitosa:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Paso 2: Crear Restaurante**
```
POST http://localhost:4000/restaurants
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

```json
{
  "name": "El Gran sabor",
  "description": "Comida guatemalteca tradicional",
  "address": "5a Calle 8-15, Zona 1, Guatemala, 01001",
  "phone": "2255-6677",
  "opening_time": "07:00",
  "closing_time": "21:00"
}
```

**Guardar el `id` del restaurante creado.**

---

### **Paso 3: Crear Items de Menú**
```
POST http://localhost:4000/restaurants/ID_DEL_RESTAURANTE/menu-items
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

```json
{
  "name": "Kak'ik",
  "description": "Sopa de pavo tradicional",
  "price": 95.00,
  "image_url": "https://ejemplo.com/kakik.jpg",
  "is_available": true
}
```

```json
{
  "name": "Jocon",
  "description": "Pollo en salsa verde",
  "price": 75.50,
  "image_url": "https://ejemplo.com/jocon.jpg",
  "is_available": true
}
```

---

### **Paso 4: Consultar Menú (Público)**
```
GET http://localhost:4000/restaurants/ID_DEL_RESTAURANTE/menu
```

---

### **Paso 5: Listar Restaurantes (Público)**
```
GET http://localhost:4000/restaurants?page=1&limit=10&onlyActive=true&search=gran
```

---

# 👉 **ORDEN SERVICE**

El servicio de Órdenes está destinado para los roles de **CLIENTE**, **RESTAURANTE** y **ADMINISTRADOR**.
Este microservicio permite la gestión completa del ciclo de vida de una orden, desde su creación hasta su finalización o cancelación.

Los estados posibles de una orden son:

* `CREADA`
* `EN_PROCESO`
* `FINALIZADA`
* `CANCELADA`
* `RECHAZADA`

---

## 📌 **ENDPOINTS DE ÓRDENES**

---

## 👤 **CLIENTE**

---

### 1. **Realizar Orden** (Solo CLIENTE)

Permite al cliente crear una nueva orden con los productos agregados previamente al carrito.
La orden es enviada al restaurante correspondiente con estado inicial `CREADA`.

```
POST http://localhost:4000/orders
Authorization: Bearer <token_cliente>
Content-Type: application/json
```

### **Json a enviar:**

```json
{
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "items": [
    {
      "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
      "quantity": 2,
      "price": 85.50,
      "product_name": "Caldo de rez"
    },
    {
      "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
      "quantity": 1,
      "price": 95.00,
      "product_name": "Pepián de Pollo Especial 2"
    }
  ]
}
```

### **Respuesta exitosa:**

```json
{
  "items": [
    {
      "id": "303cf6c3-c78f-4425-aa23-6870acbea258",
      "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
      "product_name": "Caldo de rez",
      "quantity": 2,
      "unit_price": 85.5,
      "subtotal": 171
    },
    {
      "id": "7dad3a92-4fd4-40d1-a4d1-deb074a18543",
      "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
      "product_name": "Pepián de Pollo Especial 2",
      "quantity": 1,
      "unit_price": 95,
      "subtotal": 95
    }
  ],
  "id": "0c0180b5-e615-471a-a4dd-dc14511d0b2d",
  "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "status": "CREADA",
  "total_amount": 266,
  "created_at": "2026-02-13T21:53:59.000Z",
  "updated_at": "",
  "rejection_reason": ""
}
```

### **Respuesta con errores:**

```json
{
  "statusCode": 500,
  "message": "Order validation failed: El producto no pertenece a este restaurante o no existe, El precio del producto \"Arroz de Pollo\" ha cambiado. Precio actual: $85.5"
}
```

---

### 2. **Cancelar Orden** (Solo CLIENTE)

Permite al cliente cancelar una orden siempre que no haya sido finalizada.

```
PUT http://localhost:4000/orders/:id/cancel
Authorization: Bearer <token_cliente>
```

### **Respuesta exitosa:**

```json
{
  "items": [
    {
      "id": "dbac833b-9439-4cf3-a7e4-f7bd37c5a7f4",
      "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
      "product_name": "Pepián de Pollo Especial 2",
      "quantity": 1,
      "unit_price": 95,
      "subtotal": 95
    },
    {
      "id": "e6ec8c3a-b17e-441c-ad4f-7b2b1a93a0c5",
      "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
      "product_name": "Caldo de rez",
      "quantity": 2,
      "unit_price": 85.5,
      "subtotal": 171
    }
  ],
  "id": "f1200145-b692-4ba5-bd82-06d78c831b76",
  "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "status": "CANCELADA",
  "total_amount": 266,
  "created_at": "",
  "updated_at": "2026-02-13T22:10:40.000Z",
  "rejection_reason": ""
}
```

### **Respuesta con errores:**

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### 3. **Listar Mis Órdenes** (Solo CLIENTE)

```
GET http://localhost:4000/orders/client?page=1&limit=10&status=CREADA
Authorization: Bearer <token_cliente>
```

| Query    | Descripción           | Ejemplo  |
| -------- | --------------------- | -------- |
| `page`   | Número de página      | `1`      |
| `limit`  | Resultados por página | `10`     |
| `status` | Filtrar por estado    | `CREADA` |

### **Respuesta exitosa:**

```json
{
  "orders": [
    {
      "items": [
        {
          "id": "0791f5d5-ed7f-4e16-954d-e8af0d7f6550",
          "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
          "product_name": "Caldo de rez",
          "quantity": 2,
          "unit_price": 85.5,
          "subtotal": 171
        },
        {
          "id": "792708c7-2dda-4570-8dc5-eb1e967f0c43",
          "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
          "product_name": "Pepián de Pollo Especial 2",
          "quantity": 1,
          "unit_price": 95,
          "subtotal": 95
        }
      ],
      "id": "49e958a2-8e16-4197-b7a9-12ebf6db6f4a",
      "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "status": "CREADA",
      "total_amount": 266,
      "created_at": "2026-02-13T23:03:04.000Z",
      "updated_at": "2026-02-13T23:03:04.000Z",
      "rejection_reason": ""
    },
    {
      "items": [
        {
          "id": "585104d3-53d4-442b-9c0b-64a295a32a65",
          "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
          "product_name": "Pepián de Pollo Especial 2",
          "quantity": 1,
          "unit_price": 95,
          "subtotal": 95
        },
        {
          "id": "85c8052a-b002-460d-bead-9a4d1f103897",
          "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
          "product_name": "Caldo de rez",
          "quantity": 2,
          "unit_price": 85.5,
          "subtotal": 171
        }
      ],
      "id": "cc4377e1-3e0d-4ef5-a5fe-f9ab88d87eb7",
      "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "status": "CREADA",
      "total_amount": 266,
      "created_at": "2026-02-13T23:00:08.000Z",
      "updated_at": "2026-02-13T23:00:08.000Z",
      "rejection_reason": ""
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 10
}
```

---

## 🏪 **RESTAURANTE**

---

### 4. **Aceptar Orden** (Solo RESTAURANTE)

Cuando el restaurante comienza a preparar la orden, el estado cambia a `EN_PROCESO`.

```
PUT http://localhost:4000/orders/:id/accept
Authorization: Bearer <token_restaurante>
Content-Type: application/json
```

### **Json a enviar:**

```json
{
  "restaurant_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **Respuesta exitosa:**

```json
{
  "items": [
    {
      "id": "1ff0596c-e243-4148-b17c-fe3a6be0e492",
      "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
      "product_name": "Caldo de rez",
      "quantity": 2,
      "unit_price": 85.5,
      "subtotal": 171
    },
    {
      "id": "a2945829-f689-4148-bdf8-841187d4f7e2",
      "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
      "product_name": "Pepián de Pollo Especial 2",
      "quantity": 1,
      "unit_price": 95,
      "subtotal": 95
    }
  ],
  "id": "2c36ce66-e856-478e-9ebd-e01b5313d7cf",
  "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "status": "EN_PROCESO",
  "total_amount": 266,
  "created_at": "",
  "updated_at": "2026-02-13T23:50:05.000Z",
  "rejection_reason": ""
}
```
---
### **Respuesta con errores:**
```json
{
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
---

### 5. **Rechazar Orden** (Solo RESTAURANTE)

Permite al restaurante rechazar una orden, cambiando el estado a `RECHAZADA`.

```
PUT http://localhost:4000/orders/:id/reject
Authorization: Bearer <token_restaurante>
Content-Type: application/json
```

### **Json a enviar:**

```json
{
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "reason": "Sin stock de ingredientes"
}
```

### **Respuesta exitosa:**

```json
{
  "items": [
    {
      "id": "585104d3-53d4-442b-9c0b-64a295a32a65",
      "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
      "product_name": "Pepián de Pollo Especial 2",
      "quantity": 1,
      "unit_price": 95,
      "subtotal": 95
    },
    {
      "id": "85c8052a-b002-460d-bead-9a4d1f103897",
      "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
      "product_name": "Caldo de rez",
      "quantity": 2,
      "unit_price": 85.5,
      "subtotal": 171
    }
  ],
  "id": "cc4377e1-3e0d-4ef5-a5fe-f9ab88d87eb7",
  "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "status": "RECHAZADA",
  "total_amount": 266,
  "created_at": "",
  "updated_at": "2026-02-14T00:01:49.000Z",
  "rejection_reason": "Sin stock de ingredientes"
}
```

### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Solo el restaurante puede rechazar sus pedidos"
}
```
---

### 6. **Completar Orden** (Solo RESTAURANTE)

Una vez finalizada la preparación, el restaurante debe actualizar manualmente el estado a `FINALIZADA`.

```
PUT http://localhost:4000/orders/:id/complete
Authorization: Bearer <token_restaurante>
Content-Type: application/json
```

### **Json a enviar:**

```json
{
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb"
}
```

### **Respuesta exitosa:**

```json
{
  "items": [
    {
      "id": "1ff0596c-e243-4148-b17c-fe3a6be0e492",
      "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
      "product_name": "Caldo de rez",
      "quantity": 2,
      "unit_price": 85.5,
      "subtotal": 171
    },
    {
      "id": "a2945829-f689-4148-bdf8-841187d4f7e2",
      "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
      "product_name": "Pepián de Pollo Especial 2",
      "quantity": 1,
      "unit_price": 95,
      "subtotal": 95
    }
  ],
  "id": "2c36ce66-e856-478e-9ebd-e01b5313d7cf",
  "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
  "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
  "status": "FINALIZADA",
  "total_amount": 266,
  "created_at": "2026-02-13T23:02:08.000Z",
  "updated_at": "2026-02-14T00:04:04.000Z",
  "rejection_reason": ""
}
```
### **Respuesta con errores:**
```json
{
  "statusCode": 500,
  "message": "Solo el restaurante puede completar sus pedidos"
}
```
---

### 7. **Listar Órdenes del Restaurante** (RESTAURANTE / ADMINISTRADOR)

```
GET http://localhost:4000/orders/restaurant/:restaurantId?page=1&limit=10&status=CREADA
Authorization: Bearer <token_restaurante>
```

| Query    | Descripción           | Ejemplo  |
| -------- | --------------------- | -------- |
| `page`   | Número de página      | `1`      |
| `limit`  | Resultados por página | `10`     |
| `status` | Filtrar por estado    | `CREADA` |

### **Respuesta exitosa:**

```json
{
  "orders": [
    {
      "items": [
        {
          "id": "1ff0596c-e243-4148-b17c-fe3a6be0e492",
          "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
          "product_name": "Caldo de rez",
          "quantity": 2,
          "unit_price": 85.5,
          "subtotal": 171
        },
        {
          "id": "a2945829-f689-4148-bdf8-841187d4f7e2",
          "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
          "product_name": "Pepián de Pollo Especial 2",
          "quantity": 1,
          "unit_price": 95,
          "subtotal": 95
        }
      ],
      "id": "2c36ce66-e856-478e-9ebd-e01b5313d7cf",
      "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "status": "FINALIZADA",
      "total_amount": 266,
      "created_at": "2026-02-13T23:02:08.000Z",
      "updated_at": "2026-02-14T00:04:04.000Z",
      "rejection_reason": ""
    },
    {
      "items": [
        {
          "id": "b2cdbfba-e179-4eec-96d6-0c1d9ad7d01d",
          "menu_item_id": "9914aad2-5678-4c4d-b74b-23af4b40dd33",
          "product_name": "Caldo de rez",
          "quantity": 2,
          "unit_price": 85.5,
          "subtotal": 171
        },
        {
          "id": "ddbe856a-8393-4b17-9ed3-aab2c8a1cbd1",
          "menu_item_id": "fec28fce-0a5a-4739-87e7-b5d98e7ada46",
          "product_name": "Pepián de Pollo Especial 2",
          "quantity": 1,
          "unit_price": 95,
          "subtotal": 95
        }
      ],
      "id": "73589886-0d75-40b2-872b-b94ac54a3d1b",
      "client_id": "61836239-6f9a-4012-8206-47183c55cc72",
      "restaurant_id": "8209e1cf-f337-4f0c-92c3-45aa753513cb",
      "status": "RECHAZADA",
      "total_amount": 266,
      "created_at": "2026-02-13T23:00:45.000Z",
      "updated_at": "2026-02-13T23:59:14.000Z",
      "rejection_reason": ""
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```
### **Respuesta con errores:**
```json
{
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
---

## 👨‍💼 **ADMINISTRADOR**

---

### 8. **Listar Todas las Órdenes** (Solo ADMINISTRADOR)

```
GET http://localhost:4000/orders?page=1&limit=10&status=CREADA
Authorization: Bearer <token_admin>
```

### **Respuesta exitosa:**

```json
{
  "orders": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

---

### 9. **Obtener Orden por ID** (ADMIN / RESTAURANTE / CLIENTE)

```
GET http://localhost:4000/orders/:id
Authorization: Bearer <token_valido>
```

### **Respuesta exitosa:**

```json
{
  "id": "6f4d7b5a-1111-4444-8888-123456789abc",
  "client_id": "06e903ab-8570-4b89-814d-46377fb247cf",
  "restaurant_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "FINALIZADA",
  "total_amount": 216.00,
  "items": [],
  "created_at": "2026-02-13T12:00:00.000Z",
  "updated_at": "2026-02-13T12:40:00.000Z"
}
```

---

### 10. **Listar Órdenes de un Cliente Específico** (Solo ADMINISTRADOR)

```
GET http://localhost:4000/orders/client/:clientId?page=1&limit=10&status=CREADA
Authorization: Bearer <token_admin>
```

### **Respuesta exitosa:**

```json
{
  "orders": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

---

## 📌 **FLUJO GENERAL DE UNA ORDEN**

1. El cliente crea la orden → `CREADA`
2. El restaurante la acepta → `EN_PROCESO`
3. El restaurante la finaliza → `FINALIZADA`
4. El cliente puede cancelarla antes de finalizar → `CANCELADA`
5. El restaurante puede rechazarla → `RECHAZADA`

---
